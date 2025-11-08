import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MindMapData, MindMapNode } from '../../types';

interface MindMapProps {
  data: MindMapData;
  onNodeClick?: (node: MindMapNode) => void;
}

const MindMap = ({ data, onNodeClick }: MindMapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    // Update dimensions on mount
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.getBoundingClientRect();
        setDimensions({ width: width || 800, height: height || 600 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const { width, height } = dimensions;

    // Create simulation
    const simulation = d3
      .forceSimulation(data.nodes as any)
      .force('link', d3.forceLink(data.links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Create links
    const link = svg
      .append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', '#475569')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    // Create node groups
    const node = svg
      .append('g')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(
        d3.drag<any, any>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      )
      .on('click', (_event, d) => {
        if (onNodeClick) onNodeClick(d);
      });

    // Add circles for nodes
    node
      .append('circle')
      .attr('r', 30)
      .attr('fill', (d) => (d.status === 'solid' ? '#10b981' : '#94a3b8'))
      .attr('stroke', (d) => (d.status === 'solid' ? '#059669' : '#64748b'))
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', (d) => (d.status === 'ghost' ? '5,5' : '0'))
      .style('filter', (d) => (d.status === 'solid' ? 'drop-shadow(0 0 10px #10b981)' : 'none'));

    // Add text labels
    node
      .append('text')
      .text((d) => d.word)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none');

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, dimensions, onNodeClick]);

  return (
    <div className="w-full h-full bg-synapse-background rounded-xl overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-synapse-surface/90 rounded-lg p-3 border border-gray-700">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-synapse-solid border-2 border-green-600" />
            <span className="text-gray-300">Mastered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-synapse-ghost border-2 border-gray-600 border-dashed" />
            <span className="text-gray-300">Learning</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindMap;
