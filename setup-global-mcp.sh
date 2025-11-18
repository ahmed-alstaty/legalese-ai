#!/bin/bash

# Global MCP Configuration Setup for Claude Code
# ================================================
# This script sets up MCP servers globally for all Claude Code sessions

CONFIG_DIR="$HOME/.config/claude-code"
CONFIG_FILE="$CONFIG_DIR/mcp_settings.json"

echo "Setting up global MCP configuration for Claude Code..."
echo "=================================================="
echo ""
echo "Configuration location: $CONFIG_FILE"
echo "This configuration applies to ALL Claude Code sessions, not just this project!"
echo ""

# Create config directory if it doesn't exist
mkdir -p "$CONFIG_DIR"

# Check if config already exists
if [ -f "$CONFIG_FILE" ]; then
    echo "Existing configuration found. Creating backup..."
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Create the global MCP configuration
cat > "$CONFIG_FILE" << 'EOF'
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "description": "Filesystem access - works in any directory"
    },
    "context7": {
      "transport": "http",
      "url": "https://mcp.context7.com/mcp",
      "description": "Context7 - retrieve documentation for any library"
    },
    "figma-dev-mode": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp"],
      "description": "Figma Dev Mode - convert designs to code"
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"],
      "description": "Playwright - browser automation and testing"
    },
    "ide": {
      "command": "npx",
      "args": ["-y", "@mcp-get/ide"],
      "description": "IDE integration - VS Code features"
    }
  }
}
EOF

echo "✅ Global MCP configuration created successfully!"
echo ""
echo "Available MCP servers (work in ALL projects):"
echo "----------------------------------------------"
echo "• filesystem     - File system operations"
echo "• context7       - Library documentation retrieval"
echo "• figma-dev-mode - Figma design to code conversion"
echo "• playwright     - Browser automation and testing"
echo "• ide           - IDE integration features"
echo ""
echo "To verify, run Claude Code from ANY directory and the MCP servers will be available."
echo ""
echo "Note: You may need to restart Claude Code for changes to take effect."