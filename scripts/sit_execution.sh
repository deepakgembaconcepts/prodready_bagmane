#!/bin/bash

# Configuration
API_URL="http://localhost:3001/api"
EMAIL="admin@bagmane.com"
PASSWORD="password123"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
LOG_FILE="sit_test_results_${TIMESTAMP}.log"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "===================================================" | tee -a "$LOG_FILE"
echo "  Bagmane AMS - System Integration Test (SIT)      " | tee -a "$LOG_FILE"
echo "  Date: $(date)                                    " | tee -a "$LOG_FILE"
echo "===================================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Function to check result
check_status() {
    if [ "$1" -eq 200 ] || [ "$1" -eq 201 ]; then
        echo -e "${GREEN}PASS${NC} - $2" | tee -a "$LOG_FILE"
    else
        echo -e "${RED}FAIL${NC} - $2 (HTTP $1)" | tee -a "$LOG_FILE"
        echo "Response: $3" | tee -a "$LOG_FILE"
        # exit 1  # Don't exit, keep testing other modules
    fi
}

echo "--> [1/5] Testing Authentication..." | tee -a "$LOG_FILE"

# 1. Login
LOGIN_RES=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

HTTP_CODE=$(echo "$LOGIN_RES" | tail -n1)
BODY=$(echo "$LOGIN_RES" | sed '$d')
TOKEN=$(echo "$BODY" | jq -r '.accessToken')

check_status "$HTTP_CODE" "Login Admin" "$BODY"

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo -e "${RED}CRITICAL FAIL${NC} - No Access Token received. Aborting." | tee -a "$LOG_FILE"
    exit 1
fi

echo "    Token received: ${TOKEN:0:15}..." | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

echo "--> [2/5] Testing Master Data..." | tee -a "$LOG_FILE"

# 2. Get Sites
SITES_RES=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/masters/sites" -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$SITES_RES" | tail -n1)
COUNT=$(echo "$SITES_RES" | sed '$d' | jq '. | length')
SITE_ID=$(echo "$SITES_RES" | sed '$d' | jq '.[0].id')
echo "    Using Site ID: $SITE_ID" | tee -a "$LOG_FILE"
check_status "$HTTP_CODE" "Fetch Sites (Count: $COUNT)" ""

# 3. Get Assets
ASSETS_RES=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/masters/assets?page=1&limit=5" -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$ASSETS_RES" | tail -n1)
TOTAL_ASSETS=$(echo "$ASSETS_RES" | sed '$d' | jq '.total')
check_status "$HTTP_CODE" "Fetch Assets (Total: $TOTAL_ASSETS)" ""
echo "" | tee -a "$LOG_FILE"

echo "--> [3/5] Testing Helpdesk Workflow..." | tee -a "$LOG_FILE"

# 4. Create Ticket
# Using category/subcategory from escalation rules to ensure mapping works
TICKET_DATA="{\"title\":\"SIT Test Ticket $TIMESTAMP\",\"description\":\"Test description flow\",\"priority\":\"P2\",\"category\":\"Technical\",\"subCategory\":\"HVAC\",\"issue\":\"AC Not Cooling\",\"location\":\"SIT Lab\",\"building\":\"Tower 1\",\"floor\":\"1\"}"

CREATE_TICKET_RES=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/tickets" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$TICKET_DATA")

HTTP_CODE=$(echo "$CREATE_TICKET_RES" | tail -n1)
BODY=$(echo "$CREATE_TICKET_RES" | sed '$d')
echo "DEBUG Ticket Response: $BODY" >> "$LOG_FILE" # Add debug logging

TICKET_ID=$(echo "$BODY" | jq -r '.ticket.ticketId // .ticketId') 
# Handle case where response might be {ticket: {...}} or just {...}

check_status "$HTTP_CODE" "Create Ticket ($TICKET_ID)" "$BODY"

if [ -n "$TICKET_ID" ] && [ "$TICKET_ID" != "null" ]; then
    # 5. Verify Escalation Rule Applied (Check if response has SLA data or assigned tech)
    ESCALATION=$(echo "$BODY" | jq -r '.ticket.escalationLevel // .escalationLevel')
    echo "    Escalation Level: $ESCALATION (Should be 0)" | tee -a "$LOG_FILE"
    
    # 6. Update Ticket Status
    UPDATE_RES=$(curl -s -w "\n%{http_code}" -X PUT "$API_URL/tickets/$TICKET_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"status\":\"RESOLVED\",\"comment\":\"Fixed by SIT Bot\"}")
    
    HTTP_CODE=$(echo "$UPDATE_RES" | tail -n1)
    BODY=$(echo "$UPDATE_RES" | sed '$d')
    check_status "$HTTP_CODE" "Resolve Ticket ($TICKET_ID)" "$BODY"
fi
echo "" | tee -a "$LOG_FILE"

echo "--> [4/5] Testing Inventory..." | tee -a "$LOG_FILE"

# 7. Create Inventory Item
if [ -z "$SITE_ID" ] || [ "$SITE_ID" == "null" ]; then 
    SITE_ID=1
fi

ITEM_DATA="{\"name\":\"SIT Item $TIMESTAMP\",\"category\":\"Spares\",\"quantity\":100,\"unit\":\"Nos\",\"minLevel\":10,\"siteId\":$SITE_ID,\"location\":\"Store A\"}"
CREATE_ITEM_RES=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/inventory" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$ITEM_DATA")

HTTP_CODE=$(echo "$CREATE_ITEM_RES" | tail -n1)
ITEM_BODY=$(echo "$CREATE_ITEM_RES" | sed '$d')
ITEM_ID=$(echo "$ITEM_BODY" | jq -r '.id')
check_status "$HTTP_CODE" "Create Inventory Item ($ITEM_ID)" "$ITEM_BODY"

if [ -n "$ITEM_ID" ] && [ "$ITEM_ID" != "null" ]; then
    # 8. Transaction Stock OUT
    TRANS_DATA="{\"itemId\":$ITEM_ID,\"quantity\":10,\"type\":\"OUT\",\"reason\":\"SIT Usage\"}"
    TRANS_RES=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/inventory/transaction" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$TRANS_DATA")
    
    HTTP_CODE=$(echo "$TRANS_RES" | tail -n1)
    check_status "$HTTP_CODE" "Stock OUT Transaction" ""
    
    # 9. Verify New Quantity (Should be 90)
    GET_ITEM_RES=$(curl -s -X GET "$API_URL/inventory/$ITEM_ID" -H "Authorization: Bearer $TOKEN")
    NEW_QTY=$(echo "$GET_ITEM_RES" | jq '.quantity')
    
    if [ "$NEW_QTY" -eq 90 ]; then
        echo -e "${GREEN}PASS${NC} - Quantity Update Verified (100 - 10 = $NEW_QTY)" | tee -a "$LOG_FILE"
    else
        echo -e "${RED}FAIL${NC} - Quantity Mismatch. Expected 90, got $NEW_QTY" | tee -a "$LOG_FILE"
    fi
fi
echo "" | tee -a "$LOG_FILE"

echo "--> [5/5] Testing Vendors..." | tee -a "$LOG_FILE"

# 10. Create Vendor
VENDOR_DATA="{\"name\":\"SIT Vendor $TIMESTAMP\",\"serviceCategory\":\"General\",\"contactPerson\":\"Tester\",\"email\":\"vendor@sit.com\",\"phone\":\"9999999999\",\"status\":\"Active\"}"
APP_RES=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/vendors" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$VENDOR_DATA")

HTTP_CODE=$(echo "$APP_RES" | tail -n1)
check_status "$HTTP_CODE" "Create Vendor" ""

echo "" | tee -a "$LOG_FILE"
echo "===================================================" | tee -a "$LOG_FILE"
echo "  SIT Complete. Log saved to $LOG_FILE" | tee -a "$LOG_FILE"
echo "===================================================" | tee -a "$LOG_FILE"
