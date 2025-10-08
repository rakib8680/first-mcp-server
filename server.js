

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import dotenv from 'dotenv';


dotenv.config();

// create new mcp server
const server = new McpServer({
    name: 'my-mcp-server',
    version: '1.0.0',
});

