# Global MCP Server Configuration for Claude Code

## How It Works

MCP (Model Context Protocol) servers in Claude Code are configured globally through a single configuration file:

```
~/.config/claude-code/mcp_settings.json
```

**This configuration applies to ALL Claude Code sessions**, regardless of which directory or project you're working in.

## Key Points

1. **One Global Configuration**: Unlike project-specific settings, MCP servers are configured once and work everywhere
2. **User-Level Settings**: The configuration is stored in your home directory, not in system directories
3. **No Project Files Needed**: You don't need any MCP configuration files in your projects

## Currently Configured MCP Servers

Your global configuration includes:

- **filesystem**: File system operations in any directory
- **context7**: Documentation retrieval for any library
- **figma-dev-mode**: Convert Figma designs to code
- **playwright**: Browser automation and testing
- **ide**: VS Code integration features

## Testing Global Configuration

To verify your MCP servers work globally:

1. Open a terminal in ANY directory (not just this project)
2. Run Claude Code: `claude`
3. Test an MCP command, for example:
   - Ask about documentation: "Get React hooks documentation using context7"
   - Use browser automation: "Open google.com with playwright"

## Configuration File Location

- **macOS/Linux**: `~/.config/claude-code/mcp_settings.json`
- **Windows**: `%APPDATA%\claude-code\mcp_settings.json`

## Updating Configuration

To add or modify MCP servers:

1. Edit `~/.config/claude-code/mcp_settings.json`
2. Restart Claude Code for changes to take effect

Or run the provided script:
```bash
./setup-global-mcp.sh
```

## Troubleshooting

If MCP servers aren't working:

1. Check the configuration file exists: `ls ~/.config/claude-code/mcp_settings.json`
2. Verify JSON syntax is valid: `cat ~/.config/claude-code/mcp_settings.json | jq .`
3. Restart Claude Code after making changes
4. Check Claude Code logs for any MCP server errors

## Important Notes

- The configuration at `~/.config/claude-code/mcp_settings.json` is THE global configuration
- There's no need for `/etc/claude-code/` or other system-level configurations
- Project-specific `.claude/` directories are for other settings, not MCP servers