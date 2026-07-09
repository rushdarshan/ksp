from flask import Flask, jsonify
import networkx as nx
import zcatalyst_sdk
import logging
from itertools import combinations

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

@app.route('/graph', methods=['GET'])
def get_graph():
    try:
        # Initialize catalyst SDK
        # In a real environment, initialize with req/res or standard context
        catalyst_app = zcatalyst_sdk.initialize()
        zcql = catalyst_app.zcql()
        
        # Fetch actual data from Catalyst Data Store
        accused_data = zcql.execute_query('SELECT CaseMasterID, AccusedName FROM Accused')
        victims_data = zcql.execute_query('SELECT CaseMasterID, VictimName FROM Victim')
        
        G = nx.Graph()
        
        # Group suspects and victims by CaseMasterID
        cases = {}
        for row in accused_data:
            # ZCQL returns data nested under the table name
            accused_row = row.get('Accused', {})
            c_id = accused_row.get('CaseMasterID')
            name = accused_row.get('AccusedName')
            if c_id and name:
                if c_id not in cases: cases[c_id] = {'accused': [], 'victims': []}
                cases[c_id]['accused'].append(name)
                
        for row in victims_data:
            victim_row = row.get('Victim', {})
            c_id = victim_row.get('CaseMasterID')
            name = victim_row.get('VictimName')
            if c_id and name:
                if c_id not in cases: cases[c_id] = {'accused': [], 'victims': []}
                cases[c_id]['victims'].append(name)
        
        for case_id, details in cases.items():
            for a in details['accused']:
                G.add_node(a, type='accused', group=1)
                for v in details['victims']:
                    G.add_node(v, type='victim', group=2)
                    G.add_edge(a, v, case=case_id)
            
            # Link co-accused
            for a1, a2 in combinations(details['accused'], 2):
                G.add_edge(a1, a2, case=case_id)

        # Community Detection (Louvain)
        try:
            import networkx.algorithms.community as nx_comm
            communities = nx_comm.louvain_communities(G)
            for i, comm in enumerate(communities):
                for node in comm:
                    G.nodes[node]['community'] = i
        except Exception as e:
            logging.error(f"Community detection failed: {e}")

        # Format for react-force-graph
        data = nx.node_link_data(G)
        return jsonify(data)
        
    except Exception as e:
        logging.error(str(e))
        return jsonify({"error": "Failed to generate graph", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000)
