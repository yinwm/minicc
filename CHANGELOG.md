# CHANGELOG

## [0.2.1] - 2025-09-03

### 🎉 Major Features

- **New SDK Package**: Introducing `@minicc/sdk` - integrate MiniCC into your own applications with ease
- **Print Command**: Added one-shot execution mode for quick AI assistance without interactive session

### ✨ Enhancements

- **Improved Architecture**: CLI now uses SDK internally, providing better modularity
- **Enhanced Documentation**: Added comprehensive SDK usage examples and guides
- **Better TypeScript Support**: Improved build process and type definitions

### 🔧 Technical Improvements

- Refactored CLI architecture using agent factory pattern
- Improved package structure and dependency management
- Better separation of concerns between CLI and SDK packages
- Reduced codebase complexity while adding new capabilities

### 📦 Package Changes

- **New Package**: `@minicc/sdk` for programmatic usage
- **Updated**: All packages to version 0.2.1 with improved compatibility

---

**Migration Notes**: Existing CLI users won't notice any breaking changes. The interactive mode now focuses purely on AI conversation with basic exit/quit commands.

**For Developers**: You can now integrate MiniCC's AI capabilities into your applications using the new SDK package. See the SDK documentation for integration examples.
