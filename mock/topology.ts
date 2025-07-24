// mock/services/topology.ts
import { Request, Response } from 'express';

export default {
  'GET /api/topology': (req: Request, res: Response) => {
    res.send({
      nodes: [
        { id: 'node1', label: '服务器1' },
        { id: 'node2', label: '交换机1' },
        { id: 'node3', label: '存储设备1' },
      ],
      edges: [
        { source: 'node1', target: 'node2' },
        { source: 'node2', target: 'node3' },
      ],
    });
  },
};
