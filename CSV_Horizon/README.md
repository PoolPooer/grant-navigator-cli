# CSV Horizon Analyzer

A comprehensive TypeScript-based analyzer for Horizon Europe CSV datasets that extracts key information about project titles, organization prowess, and provides specialized ICT funding analysis with collaboration insights.

## Features

🔍 **Project Analysis**
- Extract project titles from descriptive fields
- Identify key themes (Technology, Environment, Research, Healthcare)
- Analyze funding amounts and policy priorities
- Cross-reference topics and classifications

🏢 **Organization Prowess Assessment**
- Calculate prowess scores based on multiple factors
- Analyze funding patterns and project participation
- Identify leadership vs. participation roles
- Track specialization areas
- Country-based performance metrics

💻 **ICT-Specialized Analysis**
- Deep analysis of 10 ICT themes: AI, Quantum Computing, Telecommunications, Cybersecurity, IoT, Cloud Computing, Data Science, Blockchain, Software Engineering, Digital Transformation
- Multi-criteria ICT project identification (keywords, topics, policy priorities)
- Collaboration network analysis and partnership mapping
- Thematic funding distribution and market analysis
- Top collaborator identification per ICT domain

📊 **Advanced Analytics & Insights**
- Cross-theme project analysis
- Collaboration pattern identification
- Funding trend analysis
- Policy priority correlations
- Command-line insights with executive summaries
- Strategic theme deep dives

## Quick Start

### Installation & Setup
```bash
# Install dependencies
npm install

# Ensure data files are in ./data directory
ls data/  # Should show project.csv, organization.csv, etc.
```

### Run Analysis
```bash
# Complete ICT analysis
npx ts-node ict-analyzer.ts

# Generate insights report
npx ts-node insights.ts

# Basic project analysis
npx ts-node csv-analyzer.ts
```

### View Key Insights
```bash
# Full comprehensive report
npx ts-node insights.ts

# Quick executive summary
npx ts-node insights.ts summary

# Thematic funding analysis
npx ts-node insights.ts themes

# Collaboration ecosystem
npx ts-node insights.ts collab

# Strategic deep dive (AI, Quantum, Cybersecurity, Telecom)
npx ts-node insights.ts strategic

# Trends and opportunities
npx ts-node insights.ts trends
```

## Data Structure

The analyzer works with the following CSV files from the Horizon Europe dataset:

- `project.csv` - Main project information (titles, descriptions, funding)
- `organization.csv` - Organization participation and roles
- `topics.csv` - Project topic classifications
- `policyPriorities.csv` - Policy priority scores (AI, Climate, etc.)
- `webItem.csv`, `webLink.csv` - Web resources and links
- `euroSciVoc.csv`, `legalBasis.csv` - Additional metadata

## ICT Analysis Features

### 10 ICT Thematic Areas
1. **Artificial Intelligence** - ML, deep learning, neural networks
2. **Quantum Computing** - Quantum algorithms, quantum hardware
3. **Telecommunications** - 5G, 6G, network infrastructure
4. **Cybersecurity** - Security protocols, threat detection
5. **Internet of Things** - IoT devices, smart systems
6. **Cloud Computing** - Cloud services, distributed computing
7. **Data Science** - Big data, analytics, data mining
8. **Blockchain** - Distributed ledgers, cryptocurrencies
9. **Software Engineering** - Software development, methodologies
10. **Digital Transformation** - Digitalization, Industry 4.0

### ICT Collaboration Analysis
- **Partnership Networks**: Identify key collaboration patterns
- **Cross-Theme Leaders**: Organizations active across multiple ICT domains
- **Country Analysis**: National ICT research leadership
- **Funding Patterns**: Investment priorities and strategic themes

## Usage Examples

### Basic Analysis
```typescript
import { CSVAnalyzer } from './csv-analyzer';

const analyzer = new CSVAnalyzer('./data');
const projectInsights = analyzer.analyzeProjects();
const organizationProwess = analyzer.analyzeOrganizationProwess();
```

### ICT-Specific Analysis
```typescript
import { ICTAnalyzer } from './ict-analyzer';

const ictAnalyzer = new ICTAnalyzer('./data');
await ictAnalyzer.performCompleteAnalysis();
```

### Insights Generation
```typescript
import { ICTInsights } from './insights';

const insights = new ICTInsights('./ict-analysis.json');
insights.generateFullReport();
```

## Key Metrics & Outputs

### Project Insight Fields
- `projectId`, `acronym`, `fullTitle` - Project identification
- `keyThemes` - Technology, Environment, Research, Healthcare
- `description`, `fundingAmount` - Project details
- `topics`, `policyPriorities` - Classifications and priorities

### Organization Prowess Fields
- `organizationId`, `name`, `country` - Organization details
- `totalProjects`, `totalFunding` - Participation metrics
- `leadershipRoles`, `prowessScore` - Leadership analysis
- `specializations` - Research focus areas

### ICT Analysis Fields
- `theme` - ICT thematic classification
- `projectCount`, `totalFunding`, `averageFunding` - Theme metrics
- `topProjects` - Highest funded projects per theme
- `topCollaborators` - Leading organizations per theme
- `collaborationNetworks` - Partnership analysis

## Output Files

The analyzer generates comprehensive JSON outputs:
- `ict-analysis.json` - Complete ICT thematic analysis (39MB)
- `project-insights.json` - General project analysis (17MB)
- `organization-prowess.json` - Organization prowess analysis (11MB)

## Sample Insights Output

```
🚀 ICT FUNDING INSIGHTS REPORT
Generated from Horizon Europe Dataset Analysis
================================================================================

🎯 STRATEGIC OVERVIEW:
   Total ICT Projects: 20,555
   Total ICT Funding: €2.4T
   Average Project Size: €116.4M
   Thematic Areas: 10

💡 KEY INSIGHTS:
   → Top 3 themes control 64.5% of total ICT funding
   → Digital Transformation is the dominant theme
   → Strong European research institution leadership
   → Cross-border collaboration is the norm, not exception

🏆 TOP FUNDED ICT THEMES:
   1. Digital Transformation: €726.7B (30.4% share)
   2. Software Engineering: €463.1B (19.4% share)
   3. Artificial Intelligence: €351.6B (14.7% share)

🏆 TOP ICT COLLABORATORS:
   1. CENTRE NATIONAL DE LA RECHERCHE SCIENTIFIQUE CNRS (FR)
      Score: 6048 | Projects: 880 | Funding: €548.2M
   2. AGENCIA ESTATAL CONSEJO SUPERIOR DE INVESTIGACIONES CIENTIFICAS (ES)
      Score: 4355 | Projects: 559 | Funding: €246.7M
```

## Prowess Scoring Algorithm

Organizations are scored based on:
- **Project Volume** (0-30 points): Number of projects × 2
- **Total Funding** (0-25 points): Total funding ÷ 1M euros
- **Average Funding** (0-20 points): Avg funding per project ÷ 100K euros
- **Leadership** (0-15 points): Leadership roles × 5
- **Country Bonus** (0-10 points): +5 for top EU countries
- **Diversity** (0-10 points): Activity type variety × 2

## Theme Detection

### General Themes
**Technology**: AI, machine learning, digital, automation, IoT, cybersecurity, quantum
**Environment**: Climate, renewable energy, sustainable, green, biodiversity, clean
**Research**: Innovation, development, breakthrough, advanced, cutting-edge
**Healthcare**: Medical, pharmaceutical, treatment, diagnosis, clinical

### ICT-Specific Keywords
Each of the 10 ICT themes uses specialized keyword sets for precise identification:
- **AI**: artificial intelligence, machine learning, neural networks, deep learning
- **Quantum**: quantum computing, quantum algorithms, quantum cryptography
- **Cybersecurity**: cybersecurity, information security, threat detection
- **And 7 more specialized ICT domains...**

## Development

### Available Scripts
```bash
npm run build          # Compile TypeScript
npm run dev           # Run basic analysis with ts-node
npm run analyze       # Build and run analysis
npm run clean         # Clean build directory

# Direct analysis commands
npx ts-node csv-analyzer.ts      # Basic analysis
npx ts-node ict-analyzer.ts      # ICT-focused analysis
npx ts-node insights.ts          # Generate insights report
npx ts-node example-usage.ts     # Run example queries
```

### Project Structure
```
CSV_Horizon/
├── csv-analyzer.ts       # Base analysis engine
├── ict-analyzer.ts       # ICT-specialized analyzer
├── insights.ts           # Executive insights generator
├── example-usage.ts      # Usage examples
├── data/                 # CSV datasets
├── *.json               # Analysis outputs
└── package.json         # Dependencies
```

## Advanced Features

### Multi-Criteria ICT Project Identification
Projects are classified as ICT using:
1. **Keyword matching** in titles/descriptions
2. **Topic classification** analysis
3. **Policy priority** scores
4. **Framework program** categorization

### Collaboration Network Analysis
- Partnership frequency tracking
- Cross-organizational project mapping
- Thematic collaboration patterns
- Country-level cooperation analysis

### Strategic Insights
- Market concentration analysis
- Investment priority identification
- Emerging opportunity detection
- Cross-border collaboration patterns

## API Reference

### CSVAnalyzer Class
```typescript
class CSVAnalyzer {
  constructor(dataPath: string)
  analyzeProjects(): ProjectInsight[]
  analyzeOrganizationProwess(): OrganizationProwess[]
  generateAnalysisReport(): void
}
```

### ICTAnalyzer Class
```typescript
class ICTAnalyzer extends CSVAnalyzer {
  performCompleteAnalysis(): Promise<void>
  analyzeThematicCollaboration(): ThematicAnalysis
  generateICTReport(): void
}
```

### ICTInsights Class
```typescript
class ICTInsights {
  constructor(dataPath: string)
  generateExecutiveSummary(): void
  analyzeThematicLandscape(): void
  analyzeCollaborationEcosystem(): void
  generateFullReport(): void
}
```

## Data Sources & Compatibility

This analyzer is optimized for Horizon Europe CSV datasets. Ensure your data follows the expected schema:
- Semicolon-separated values
- Quoted fields for complex text
- UTF-8 encoding
- Standard Horizon Europe field names

## License

MIT License - See LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues or questions:
1. Check the example usage files
2. Review the generated JSON outputs
3. Run insights with specific sections
4. Examine the TypeScript interfaces for data structures 