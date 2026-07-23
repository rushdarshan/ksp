const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

const unwrap = (row, table) => row?.[table] || row || {};

app.get('/graph', async (req, res) => {
    try {
        const zcql = catalyst.initialize(req).zcql();
        const [accusedRows, caseRows] = await Promise.all([
            zcql.executeZCQLQuery('SELECT * FROM Accused LIMIT 1000'),
            zcql.executeZCQLQuery('SELECT CaseMasterID, CrimeNo FROM CaseMaster LIMIT 1000'),
        ]);
        const accused = accusedRows.map(row => unwrap(row, 'Accused'));
        const cases = new Map(caseRows.map(row => {
            const item = unwrap(row, 'CaseMaster');
            return [String(item.CaseMasterID), item.CrimeNo || item.CaseMasterID];
        }));
        const byCase = new Map();
        accused.forEach(person => {
            const caseId = String(person.CaseMasterID);
            if (!byCase.has(caseId)) byCase.set(caseId, []);
            byCase.get(caseId).push(person);
        });

        const nodeMap = new Map();
        const linkMap = new Map();
        byCase.forEach((people, caseId) => {
            const fir = String(cases.get(caseId) || caseId);
            people.forEach(person => {
                const id = person.AccusedName || `Accused ${person.AccusedMasterID}`;
                const node = nodeMap.get(id) || { id, personId: person.PersonID || 'A3', cases: 0, firNos: [], community: 0 };
                node.cases += 1;
                if (!node.firNos.includes(fir)) node.firNos.push(fir);
                nodeMap.set(id, node);
            });
            for (let i = 0; i < people.length; i += 1) {
                for (let j = i + 1; j < people.length; j += 1) {
                    const source = people[i].AccusedName || `Accused ${people[i].AccusedMasterID}`;
                    const target = people[j].AccusedName || `Accused ${people[j].AccusedMasterID}`;
                    const key = [source, target].sort().join('|');
                    const link = linkMap.get(key) || { source, target, cases: 0, firNos: [], role: `${people[i].PersonID || 'A3'}-${people[j].PersonID || 'A3'}` };
                    link.cases += 1;
                    if (!link.firNos.includes(fir)) link.firNos.push(fir);
                    linkMap.set(key, link);
                }
            }
        });

        const nodes = [...nodeMap.values()];
        const links = [...linkMap.values()];
        const adjacency = new Map(nodes.map(node => [node.id, new Set()]));
        links.forEach(link => {
            adjacency.get(link.source)?.add(link.target);
            adjacency.get(link.target)?.add(link.source);
        });
        let community = 0;
        const visited = new Set();
        nodes.forEach(node => {
            if (visited.has(node.id)) return;
            community += 1;
            const queue = [node.id];
            while (queue.length) {
                const id = queue.shift();
                if (visited.has(id)) continue;
                visited.add(id);
                const current = nodeMap.get(id);
                if (current) current.community = community;
                adjacency.get(id)?.forEach(next => queue.push(next));
            }
        });

        res.status(200).json({
            nodes,
            links,
            summary: {
                totalAccused: nodes.length,
                A1Count: nodes.filter(node => node.personId === 'A1').length,
                communities: community,
            },
            metadata: {
                mode: 'live',
                method: 'shared-FIR connected components',
                note: 'Connected components show record co-occurrence only; they do not establish criminal association or guilt.',
                humanReviewRequired: true,
            },
        });
    } catch (error) {
        console.error('Co-accused graph failed:', error);
        res.status(500).json({ error: 'Unable to build co-accused graph' });
    }
});

module.exports = app;
