import React, { useMemo } from 'react';
import type { Asset } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AssetOperationalAgeProps {
    assets: Asset[];
}

export const AssetOperationalAge: React.FC<AssetOperationalAgeProps> = ({ assets }) => {
    const ageBuckets = useMemo(() => {
        const now = new Date();
        const buckets = {
            '0-2 years': 0,
            '2-4 years': 0,
            '4-6 years': 0,
            '6-8 years': 0,
            '8+ years': 0
        };

        assets.forEach(asset => {
            const ageInYears = (now.getTime() - asset.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
            if (ageInYears < 2) buckets['0-2 years']++;
            else if (ageInYears < 4) buckets['2-4 years']++;
            else if (ageInYears < 6) buckets['4-6 years']++;
            else if (ageInYears < 8) buckets['6-8 years']++;
            else buckets['8+ years']++;
        });

        return Object.entries(buckets).map(([name, value]) => ({ name, value }));
    }, [assets]);

    const stats = useMemo(() => {
        const total = assets.length;
        const avgAge = assets.reduce((acc, asset) => {
            const age = (new Date().getTime() - asset.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
            return acc + age;
        }, 0) / total;

        const oldest = Math.max(...assets.map(asset =>
            (new Date().getTime() - asset.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
        ));

        const newest = Math.min(...assets.map(asset =>
            (new Date().getTime() - asset.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
        ));

        return { total, avgAge: avgAge.toFixed(1), oldest: oldest.toFixed(1), newest: newest.toFixed(1) };
    }, [assets]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Asset Operational Age Analysis</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
                        <div className="text-sm text-slate-500">Total Assets</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{stats.avgAge} yrs</div>
                        <div className="text-sm text-slate-500">Average Age</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">{stats.newest} yrs</div>
                        <div className="text-sm text-slate-500">Newest Asset</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-600">{stats.oldest} yrs</div>
                        <div className="text-sm text-slate-500">Oldest Asset</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Age Distribution</h3>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={ageBuckets}>
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Assets by Age Bucket</h3>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {ageBuckets.map(bucket => (
                            <div key={bucket.name} className="flex justify-between items-center">
                                <span className="font-medium">{bucket.name}</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-32 bg-slate-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${(bucket.value / stats.total) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm text-slate-600 w-8 text-right">{bucket.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};