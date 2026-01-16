/**
 * Ticket Master Service
 * Loads and manages ticket master data from escalation CSV
 */

export interface TicketMasterRule {
  ticketType: string;
  issueType: string;
  category: string;
  subCategory: string;
  issue: string;
  priority: string;
  l0ResponseTime: number;
  l0ResolutionTime: number;
  l0Assignee: string;
  l1ResponseTime: number;
  l1ResolutionTime: number;
  l1Assignee: string;
  l2ResponseTime: number;
  l2ResolutionTime: number;
  l2Assignee: string;
  l3ResponseTime: number;
  l3ResolutionTime: number;
  l3Assignee: string;
  l4ResponseTime: number;
  l4ResolutionTime: number;
  l4Assignee: string;
  l5ResponseTime: number;
  l5ResolutionTime: number;
  l5Assignee: string;
  status: string;
  clientEscalation: boolean;
  tenantEscalation: boolean;
}

let cachedTicketMaster: TicketMasterRule[] | null = null;

/**
 * Get all ticket master rules
 */
// Helper to get headers
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Get all ticket master rules
 */
export async function getTicketMasterRules(): Promise<TicketMasterRule[]> {
  if (cachedTicketMaster) {
    return cachedTicketMaster;
  }

  try {
    const response = await fetch('http://localhost:3001/api/escalation/stats', {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch ticket master');
    const data = await response.json();

    // Parse the escalation rules into TicketMasterRule format
    cachedTicketMaster = (data.rules || []).map((rule: any) => ({
      ticketType: rule['Ticket Type'] || rule.ticketType || 'Standard',
      issueType: rule['Issue Type'] || rule.issueType || '',
      category: rule.Category || rule.category || '',
      subCategory: rule['Sub Category'] || rule.subCategory || '',
      issue: rule.Issue || rule.issue || '',
      priority: rule.Priority || rule.priority || 'P3',
      l0ResponseTime: parseInt(rule['L0 Response Time'] || rule.l0ResponseTime || '30'),
      l0ResolutionTime: parseInt(rule['L0 ResoultionTime'] || rule.l0ResolutionTime || '1440'),
      l0Assignee: rule['L0 Assignee'] || rule.l0Assignee || 'L0 Technician',
      l1ResponseTime: parseInt(rule['L1 Response Time'] || rule.l1ResponseTime || '120'),
      l1ResolutionTime: parseInt(rule['L1 ResoultionTime'] || rule.l1ResolutionTime || '2880'),
      l1Assignee: rule['L1 Assignee'] || rule.l1Assignee || 'L1 Manager',
      l2ResponseTime: parseInt(rule['L2 Response Time'] || rule.l2ResponseTime || '240'),
      l2ResolutionTime: parseInt(rule['L2 ResoultionTime'] || rule.l2ResolutionTime || '4320'),
      l2Assignee: rule['L2 Assignee'] || rule.l2Assignee || 'L2 Manager',
      l3ResponseTime: parseInt(rule['L3 Response Time'] || rule.l3ResponseTime || '720'),
      l3ResolutionTime: parseInt(rule['L3 ResoultionTime'] || rule.l3ResolutionTime || '5160'),
      l3Assignee: rule['L3 Assignee'] || rule.l3Assignee || 'L3 Manager',
      l4ResponseTime: parseInt(rule['L4 Response Time'] || rule.l4ResponseTime || '1800'),
      l4ResolutionTime: parseInt(rule['L4 ResoultionTime'] || rule.l4ResolutionTime || '6600'),
      l4Assignee: rule['L4 Assignee'] || rule.l4Assignee || 'L4 Manager',
      l5ResponseTime: parseInt(rule['L5 Response Time'] || rule.l5ResponseTime || '2160'),
      l5ResolutionTime: parseInt(rule['L5 ResoultionTime'] || rule.l5ResolutionTime || '8040'),
      l5Assignee: rule['L5 Assignee'] || rule.l5Assignee || 'L5 Manager',
      status: rule.Status || rule.status || 'ACTIVE',
      clientEscalation: rule['Client Escalation'] === 'TRUE' || rule.clientEscalation === true,
      tenantEscalation: rule['Tenant Escalation'] === 'TRUE' || rule.tenantEscalation === true,
    }));

    return cachedTicketMaster;
  } catch (error) {
    console.error('Error loading ticket master:', error);
    return [];
  }
}

/**
 * Find matching ticket master rule for category/subcategory/issue
 */
export async function findTicketMasterRule(
  category: string,
  subCategory: string,
  issue: string
): Promise<TicketMasterRule | null> {
  const rules = await getTicketMasterRules();

  const matching = rules.find(
    rule =>
      rule.category === category &&
      rule.subCategory === subCategory &&
      rule.issue === issue
  );

  return matching || null;
}

/**
 * Get all unique issues for a category/subcategory
 */
export async function getIssuesForSubcategory(
  category: string,
  subCategory: string
): Promise<string[]> {
  try {
    const response = await fetch(
      `http://localhost:3001/api/escalation/issues/${encodeURIComponent(category)}/${encodeURIComponent(subCategory)}`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch issues');
    const issues = await response.json();
    return Array.isArray(issues) ? issues : [];
  } catch (error) {
    console.error('Error loading issues:', error);
    return [];
  }
}

/**
 * Get priority for a specific issue
 */
export async function getPriorityForIssue(
  category: string,
  subCategory: string,
  issue: string
): Promise<string> {
  try {
    const response = await fetch(
      `http://localhost:3001/api/escalation/rule/${encodeURIComponent(category)}/${encodeURIComponent(subCategory)}/${encodeURIComponent(issue)}`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch priority');
    const rule = await response.json();
    return rule?.priority || rule?.Priority || 'P3 - Medium';
  } catch (error) {
    console.error('Error loading priority:', error);
    return 'P3 - Medium';
  }
}
