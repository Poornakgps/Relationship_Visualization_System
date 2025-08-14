import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, ElementDefinition } from 'cytoscape';
// @ts-ignore - No type definitions available
import dagre from 'cytoscape-dagre';
// @ts-ignore - No type definitions available
import coseBilkent from 'cytoscape-cose-bilkent';
import { ZoomIn, ZoomOut, Maximize2, Download, RotateCcw, Layout, Grid3X3, Circle, GitBranch } from 'lucide-react';
import { GraphData, GraphNode } from '@/types';
import { RELATIONSHIP_CONFIGS, getNodeColor } from '@/utils';

// Register extensions
cytoscape.use(dagre);
cytoscape.use(coseBilkent);

interface GraphVisualizationProps {
  graphData: GraphData;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ graphData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [layoutName, setLayoutName] = useState<'cose-bilkent' | 'dagre' | 'circle' | 'grid'>('cose-bilkent');

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current || !graphData) return;

    setIsLoading(true);

    // Convert graph data to Cytoscape format
    const elements: ElementDefinition[] = [
      // Nodes
      ...graphData.nodes.map(node => {
        const nodeColor = getNodeColor(node);
        const size = node.type === 'user' ? 35 : Math.min(60, Math.max(25, (node.data as any).amount / 500 + 25));
        
        return {
          data: {
            id: node.id,
            label: node.label,
            type: node.type,
            nodeData: node.data,
            backgroundColor: nodeColor,
            borderColor: node.type === 'user' ? '#1E40AF' : '#047857',
            size: size,
          }
        };
      }),
      // Edges
      ...graphData.edges.map(edge => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          type: edge.type,
          color: edge.color,
          width: edge.weight || 2,
        }
      }))
    ];

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        // Node styles
        {
          selector: 'node',
          style: {
            'width': 'data(size)',
            'height': 'data(size)',
            'background-color': 'data(backgroundColor)',
            'border-color': 'data(borderColor)',
            'border-width': '2px',
            'label': 'data(label)',
            'color': '#374151',
            'font-size': '10px',
            'font-weight': 600 as any,
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '80px',
            'z-index': 10,
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': '3px',
            'border-color': '#3B82F6',
            'z-index': 999,
          }
        },
        // Edge styles
        {
          selector: 'edge',
          style: {
            'curve-style': 'bezier',
            'opacity': 0.7,
            'line-color': 'data(color)',
            'width': 'data(width)',
            'target-arrow-shape': 'triangle-backcurve',
            'target-arrow-color': 'data(color)',
            'arrow-scale': 1.2,
            'label': 'data(label)',
            'font-size': '8px',
            'color': '#6B7280',
            'text-rotation': 'autorotate',
            'text-margin-y': -8,
            'text-background-color': 'white',
            'text-background-opacity': 0.9,
            'text-background-padding': '1px',
            'text-background-shape': 'roundrectangle',
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'opacity': 1,
            'width': 'mapData(width, 1, 5, 3, 8)',
            'z-index': 999,
          }
        },
        {
          selector: 'edge.highlighted',
          style: {
            'opacity': 0.9,
            'width': 'mapData(width, 1, 5, 2, 6)',
            'z-index': 999,
          }
        },
        // Transaction relationship edges (no arrows for undirected relationships)
        {
          selector: 'edge[type="SHARES_EMAIL"], edge[type="SHARES_PHONE"], edge[type="SHARES_ADDRESS"], edge[type="SAME_DEVICE"], edge[type="SAME_IP"], edge[type="SAME_PAYMENT_METHOD"]',
          style: {
            'target-arrow-shape': 'none',
            'curve-style': 'straight',
          }
        }
      ],
      layout: {
        name: 'cose-bilkent',
        quality: 'default',
        nodeDimensionsIncludeLabels: true,
        refresh: 30,
        fit: true,
        padding: 10,
        randomize: true,
        componentSpacing: 100,
        nodeRepulsion: 4500,
        nodeOverlap: 10,
        idealEdgeLength: 100,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 2500,
        tile: true,
        tilingPaddingVertical: 10,
        tilingPaddingHorizontal: 10
      } as any,
      wheelSensitivity: 0.2,
      minZoom: 0.2,
      maxZoom: 4,
      boxSelectionEnabled: true,
      selectionType: 'single',
    });

    // Event handlers
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const nodeData = node.data();
      setSelectedNode({
        id: nodeData.id,
        label: nodeData.label,
        type: nodeData.type,
        data: nodeData.nodeData,
      });
      
      // Highlight connected nodes
      const connectedEdges = node.connectedEdges();
      const connectedNodes = connectedEdges.connectedNodes();
      
      cy.elements().removeClass('highlighted');
      node.addClass('highlighted');
      connectedNodes.addClass('highlighted');
      connectedEdges.addClass('highlighted');
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        cy.elements().removeClass('highlighted');
      }
    });

    cy.ready(() => {
      setIsLoading(false);
    });

    cyRef.current = cy;

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [graphData]);

  // Control functions
  const zoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.2);
  const zoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const fitToScreen = () => cyRef.current?.fit();
  const resetLayout = () => {
    if (cyRef.current) {
      cyRef.current.layout({
        name: layoutName,
        fit: true,
        padding: 20,
        ...(layoutName === 'cose-bilkent' && {
          randomize: true,
          nodeRepulsion: 8000,
          idealEdgeLength: 80,
          edgeElasticity: 0.3,
          nestingFactor: 0.1,
          gravity: 0.3,
          numIter: 3000,
          tile: true,
          tilingPaddingVertical: 20,
          tilingPaddingHorizontal: 20,
        })
      } as any).run();
    }
  };

  const changeLayout = (newLayout: 'cose-bilkent' | 'dagre' | 'circle' | 'grid') => {
    if (cyRef.current) {
      setLayoutName(newLayout);
      let layoutOptions: any = {
        name: newLayout,
        animate: true,
        animationDuration: 1000,
      };

      switch (newLayout) {
        case 'cose-bilkent':
          layoutOptions = {
            ...layoutOptions,
            randomize: false,
            nodeRepulsion: 8000,
            idealEdgeLength: 80,
            edgeElasticity: 0.3,
            nestingFactor: 0.1,
            gravity: 0.3,
            numIter: 3000,
            tile: true,
            tilingPaddingVertical: 20,
            tilingPaddingHorizontal: 20,
          };
          break;
        case 'dagre':
          layoutOptions = {
            ...layoutOptions,
            rankDir: 'TB',
            ranker: 'longest-path',
            nodeSep: 50,
            rankSep: 100,
          };
          break;
        case 'circle':
          layoutOptions = {
            ...layoutOptions,
            radius: Math.min(300, graphData.nodes.length * 15),
            spacing: 1.5,
          };
          break;
        case 'grid':
          layoutOptions = {
            ...layoutOptions,
            rows: Math.ceil(Math.sqrt(graphData.nodes.length)),
            cols: Math.ceil(Math.sqrt(graphData.nodes.length)),
            position: () => ({ row: 0, col: 0 }),
          };
          break;
      }

      cyRef.current.layout(layoutOptions).run();
    }
  };

  const downloadImage = () => {
    if (cyRef.current) {
      const png = cyRef.current.png({ scale: 2, full: true });
      const link = document.createElement('a');
      link.download = 'graph-visualization.png';
      link.href = png;
      link.click();
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="spinner w-8 h-8 mb-2 mx-auto" />
            <p className="text-sm text-gray-600">Loading graph...</p>
          </div>
        </div>
      )}

      {/* Graph container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Controls */}
      <div className="cytoscape-controls">
        {/* Zoom Controls */}
        <div className="flex flex-col gap-1">
          <button
            onClick={zoomIn}
            className="btn btn-secondary btn-sm"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            className="btn btn-secondary btn-sm"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={fitToScreen}
            className="btn btn-secondary btn-sm"
            title="Fit to Screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Layout Controls */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => changeLayout('cose-bilkent')}
            className={`btn btn-sm ${layoutName === 'cose-bilkent' ? 'btn-primary' : 'btn-secondary'}`}
            title="Force Layout"
          >
            <Layout className="w-4 h-4" />
          </button>
          <button
            onClick={() => changeLayout('dagre')}
            className={`btn btn-sm ${layoutName === 'dagre' ? 'btn-primary' : 'btn-secondary'}`}
            title="Hierarchical Layout"
          >
            <GitBranch className="w-4 h-4" />
          </button>
          <button
            onClick={() => changeLayout('circle')}
            className={`btn btn-sm ${layoutName === 'circle' ? 'btn-primary' : 'btn-secondary'}`}
            title="Circle Layout"
          >
            <Circle className="w-4 h-4" />
          </button>
          <button
            onClick={() => changeLayout('grid')}
            className={`btn btn-sm ${layoutName === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
            title="Grid Layout"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-1">
          <button
            onClick={resetLayout}
            className="btn btn-secondary btn-sm"
            title="Reset Layout"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={downloadImage}
            className="btn btn-secondary btn-sm"
            title="Download as PNG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="cytoscape-legend">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Graph Legend</h4>
        
        {/* Node types */}
        <div className="mb-3">
          <div className="text-xs font-medium text-gray-600 mb-2">Node Types</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded-full bg-blue-500 border border-blue-700" />
              <span className="text-xs text-gray-700">Users ({graphData.nodes.filter(n => n.type === 'user').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded bg-green-500 border border-green-700" />
              <span className="text-xs text-gray-700">Transactions ({graphData.nodes.filter(n => n.type === 'transaction').length})</span>
            </div>
          </div>
        </div>
        
        {/* Relationship types */}
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">Relationships</div>
          <div className="space-y-1">
            {Object.entries(RELATIONSHIP_CONFIGS).map(([key, config]) => {
              const edgeCount = graphData.edges.filter(e => e.type === key).length;
              if (edgeCount === 0) return null;
              
              return (
                <div key={key} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-1 rounded-sm" 
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-xs text-gray-700">
                    {config.label} ({edgeCount})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Layout info */}
        <div className="mt-3 pt-2 border-t">
          <div className="text-xs text-gray-500">
            Current: {layoutName.charAt(0).toUpperCase() + layoutName.slice(1).replace('-', ' ')}
          </div>
        </div>
      </div>

      {/* Selected node info */}
      {selectedNode && (
        <div className="absolute top-4 left-4 bg-white border rounded-lg shadow-xl p-4 max-w-sm z-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${selectedNode.type === 'user' ? 'bg-blue-500' : 'bg-green-500'}`} />
              {selectedNode.type === 'user' ? 'User Details' : 'Transaction Details'}
            </h4>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              title="Close"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">ID:</span>
              <span className="font-mono text-gray-900">{selectedNode.data.id}</span>
            </div>
            
            {selectedNode.type === 'user' ? (
              <>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Name:</span>
                  <span className="text-gray-900">{selectedNode.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Email:</span>
                  <span className="text-blue-600 text-xs">{(selectedNode.data as any).email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Phone:</span>
                  <span className="font-mono text-xs">{(selectedNode.data as any).phone}</span>
                </div>
                <div className="pt-1">
                  <span className="font-medium text-gray-600">Address:</span>
                  <div className="text-xs text-gray-700 mt-1 leading-relaxed">
                    {(selectedNode.data as any).address}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Amount:</span>
                  <span className="font-semibold text-green-600">{selectedNode.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    (selectedNode.data as any).status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    (selectedNode.data as any).status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {(selectedNode.data as any).status}
                  </span>
                </div>
                <div className="pt-1">
                  <span className="font-medium text-gray-600">Description:</span>
                  <div className="text-xs text-gray-700 mt-1 leading-relaxed">
                    {(selectedNode.data as any).description}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Payment:</span>
                  <span className="text-xs text-gray-700">{(selectedNode.data as any).paymentMethod}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphVisualization; 