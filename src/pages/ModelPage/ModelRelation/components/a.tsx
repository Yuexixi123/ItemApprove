import React, { useEffect, useRef } from 'react';
import G6, { TreeGraph } from '@antv/g6';

export interface TopologyNode {
  id: string;
  name: string;
  type: string;
  level: number;
  icon?: string;
  children?: TopologyNode[];
}

interface TopologyGraphProps {
  data: TopologyNode;
}

// 定义计算最佳锚点的函数
const calculateOptimalAnchors = (cfg: any) => {
  const sourceNode = cfg.sourceNode;
  const targetNode = cfg.targetNode;

  if (!sourceNode || !targetNode) {
    return {
      sourceAnchor: cfg.startPoint,
      targetAnchor: cfg.endPoint,
    };
  }

  const sourceModel = sourceNode.getModel();
  const targetModel = targetNode.getModel();

  const sourceX = sourceModel.x || 0;
  const sourceY = sourceModel.y || 0;
  const targetX = targetModel.x || 0;
  const targetY = targetModel.y || 0;

  const radius = 40; // 节点半径

  // 计算两个节点中心的向量
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) {
    return {
      sourceAnchor: { x: sourceX, y: sourceY },
      targetAnchor: { x: targetX, y: targetY },
    };
  }

  // 归一化向量
  const unitX = dx / distance;
  const unitY = dy / distance;

  // 计算源节点的连接点（朝向目标节点的边缘）
  const sourceAnchor = {
    x: sourceX + unitX * radius,
    y: sourceY + unitY * radius,
  };

  // 计算目标节点的连接点（朝向源节点的边缘）
  const targetAnchor = {
    x: targetX - unitX * radius,
    y: targetY - unitY * radius,
  };

  return { sourceAnchor, targetAnchor };
};

const TopologyGraph: React.FC<TopologyGraphProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<TreeGraph | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    console.log('组件初始化，数据:', data);

    // 注册自定义节点
    try {
      G6.registerNode(
        'custom-topology-node',
        {
          draw(cfg: any, group: any) {
            console.log('🎯 自定义节点绘制被调用:', cfg);

            const { name, nodeType, icon } = cfg; // 使用 nodeType 而不是 type

            // 根据节点类型设置不同颜色
            const colorMap: Record<string, string> = {
              business: '#1890ff',
              cluster: '#52c41a',
              host: '#fa8c16',
            };

            const color = colorMap[nodeType as string] || '#d9d9d9'; // 使用 nodeType

            // 绘制圆形节点背景
            const circle = group!.addShape('circle', {
              attrs: {
                x: 0,
                y: 0,
                r: 40,
                fill: color,
                stroke: '#fff',
                lineWidth: 2,
                cursor: 'pointer',
              },
              name: 'circle-shape',
            });

            // 添加图标（如果有）
            if (icon) {
              group!.addShape('text', {
                attrs: {
                  x: 0,
                  y: -8,
                  textAlign: 'center',
                  textBaseline: 'middle',
                  text: icon,
                  fontSize: 16,
                  fill: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  capture: false, // 添加这个属性
                },
                name: 'icon-shape',
                capture: false, // 也在这里添加
              });
            }

            // 添加节点名称文本
            group!.addShape('text', {
              attrs: {
                x: 0,
                y: icon ? 12 : 0,
                textAlign: 'center',
                textBaseline: 'middle',
                text: name || 'Unknown',
                fontSize: 10,
                fill: '#fff',
                fontWeight: 'normal',
                cursor: 'pointer',
                capture: false, // 添加这个属性
              },
              name: 'text-shape',
              capture: false, // 也在这里添加
            });

            return circle;
          },

          getAnchorPoints() {
            // 动态计算锚点
            const points = [];
            const count = 16; // 16个方向的锚点

            for (let i = 0; i < count; i++) {
              const angle = (2 * Math.PI * i) / count;
              const x = 0.5 + 0.5 * Math.cos(angle);
              const y = 0.5 + 0.5 * Math.sin(angle);
              points.push([x, y]);
            }

            return points;
          },

          // 添加这个方法来优化连接点选择
          getLinkPoint(cfg: any) {
            const { startPoint, endPoint } = cfg;
            if (!startPoint || !endPoint) return null;

            const dx = endPoint.x - startPoint.x;
            const dy = endPoint.y - startPoint.y;
            const r = 40; // 节点半径

            // 计算角度
            const angle = Math.atan2(dy, dx);

            // 根据角度计算最佳连接点
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;

            return { x, y };
          },

          // 添加这个方法来处理连接点
          getShapeStyle() {
            return {
              r: 40, // 确保半径与绘制时一致
            };
          },
        },
        'circle',
      );

      console.log('✅ 节点注册成功');
    } catch (error) {
      console.error('❌ 节点注册失败:', error);
    }

    // 注册自定义边
    try {
      G6.registerEdge(
        'custom-topology-edge',
        {
          draw(cfg: any, group: any) {
            console.log('🔗 自定义边绘制被调用:', cfg);

            // const startPoint = cfg!.startPoint!;
            // const endPoint = cfg!.endPoint!;

            // 动态计算最佳连接点
            const { sourceAnchor, targetAnchor } = calculateOptimalAnchors(cfg);

            const line = group!.addShape('path', {
              attrs: {
                stroke: '#91d5ff',
                lineWidth: 2,
                path: [
                  ['M', sourceAnchor.x, sourceAnchor.y],
                  ['L', targetAnchor.x, targetAnchor.y],
                ],
              },
              name: 'line-shape',
            });

            const midX = (sourceAnchor.x + targetAnchor.x) / 2;
            const midY = (sourceAnchor.y + targetAnchor.y) / 2;

            group!.addShape('rect', {
              attrs: {
                x: midX - 20,
                y: midY - 8,
                width: 40,
                height: 16,
                fill: '#fff',
                stroke: '#91d5ff',
                lineWidth: 1,
                radius: 2,
              },
              name: 'label-bg',
            });

            group!.addShape('text', {
              attrs: {
                x: midX,
                y: midY,
                textAlign: 'center',
                textBaseline: 'middle',
                text: '属于',
                fontSize: 10,
                fill: '#1890ff',
              },
              name: 'label-text',
            });

            return line;
          },

          update(cfg: any, item: any) {
            const group = item.getContainer();

            // 重新计算最佳锚点
            const { sourceAnchor, targetAnchor } = calculateOptimalAnchors(cfg);

            const lineShape = group.find((element: any) => element.get('name') === 'line-shape');
            if (lineShape) {
              lineShape.attr({
                path: [
                  ['M', sourceAnchor.x, sourceAnchor.y],
                  ['L', targetAnchor.x, targetAnchor.y],
                ],
              });
            }

            const midX = (sourceAnchor.x + targetAnchor.x) / 2;
            const midY = (sourceAnchor.y + targetAnchor.y) / 2;

            const labelBg = group.find((element: any) => element.get('name') === 'label-bg');
            if (labelBg) {
              labelBg.attr({
                x: midX - 20,
                y: midY - 8,
              });
            }

            const labelText = group.find((element: any) => element.get('name') === 'label-text');
            if (labelText) {
              labelText.attr({
                x: midX,
                y: midY,
              });
            }
          },
        },
        'line',
      );

      console.log('✅ 边注册成功');
    } catch (error) {
      console.error('❌ 边注册失败:', error);
    }

    // 转换数据格式 - 关键修改：为每个节点强制指定类型
    const transformData = (node: TopologyNode): any => {
      const result: any = {
        id: node.id,
        name: node.name,
        type: 'custom-topology-node', // 强制指定节点类型
        nodeType: node.type, // 保存原始类型用于颜色判断
        level: node.level,
        icon: node.icon,
      };

      if (node.children && node.children.length > 0) {
        result.children = node.children.map((child) => transformData(child));
      }

      return result;
    };

    const transformedData = transformData(data);
    console.log('转换后的数据:', transformedData);

    // 创建图实例
    const graph = new G6.TreeGraph({
      container: containerRef.current,
      width: containerRef.current.offsetWidth,
      height: 600,
      modes: {
        default: ['drag-canvas', 'zoom-canvas', 'drag-node'],
      },
      defaultNode: {
        type: 'custom-topology-node',
        size: 80,
      },
      defaultEdge: {
        type: 'custom-topology-edge',
      },
      layout: {
        type: 'compactBox',
        direction: 'TB',
        getId: (d: any) => d.id,
        getHeight: () => 80,
        getWidth: () => 80,
        getVGap: () => 100,
        getHGap: () => 120,
      },
      animate: true,
    });

    console.log('📊 图实例创建完成');

    // 监听节点点击事件
    graph.on('node:click', (evt: any) => {
      const { item } = evt;
      const model = item?.getModel();
      console.log('🖱️ 节点点击:', model);
    });

    // 监听节点拖动事件，实时更新连接线
    graph.on('node:dragstart', (evt: any) => {
      const { item } = evt;
      // 获取与当前节点相关的所有边
      const edges = item.getEdges();
      edges.forEach((edge: any) => {
        edge.refresh();
      });
    });

    graph.on('node:drag', (evt: any) => {
      const { item } = evt;
      // 实时更新连接线
      const edges = item.getEdges();
      edges.forEach((edge: any) => {
        edge.refresh();
      });
    });

    graph.on('node:dragend', (evt: any) => {
      const { item } = evt;
      // 拖动结束后最终更新
      const edges = item.getEdges();
      edges.forEach((edge: any) => {
        edge.refresh();
      });
    });

    console.log('🎨 开始渲染图形...');
    graph.data(transformedData);
    graph.render();
    graph.fitView();
    console.log('✨ 图形渲染完成');

    graphRef.current = graph;

    const handleResize = () => {
      if (graph && !graph.get('destroyed')) {
        graph.changeSize(containerRef.current!.offsetWidth, 600);
        graph.fitView();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (graph && !graph.get('destroyed')) {
        graph.destroy();
      }
    };
  }, [data]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '600px',
        border: '1px solid #d9d9d9',
        borderRadius: '6px',
        backgroundColor: '#fafafa',
      }}
    />
  );
};

export default TopologyGraph;
export type { TopologyGraphProps };
