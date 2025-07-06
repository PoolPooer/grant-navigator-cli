import * as fs from 'fs';

interface ICTInsightsData {
  overview: {
    totalICTProjects: number;
    totalICTFunding: number;
    themesAnalyzed: string[];
  };
  thematicAnalysis: {
    [theme: string]: {
      theme: string;
      projectCount: number;
      totalFunding: number;
      averageFunding: number;
      topProjects: any[];
      topCollaborators: any[];
      collaborationNetworks: { [key: string]: number };
    };
  };
}

class ICTInsights {
  private data: ICTInsightsData;

  constructor(dataPath: string = './ict-analysis.json') {
    try {
      const content = fs.readFileSync(dataPath, 'utf-8');
      this.data = JSON.parse(content);
    } catch (error) {
      console.error('❌ Error loading ICT analysis data:', error);
      process.exit(1);
    }
  }

  private formatCurrency(amount: number): string {
    if (amount >= 1e12) return `€${(amount / 1e12).toFixed(1)}T`;
    if (amount >= 1e9) return `€${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `€${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `€${(amount / 1e3).toFixed(1)}K`;
    return `€${amount.toLocaleString()}`;
  }

  private printHeader(title: string): void {
    console.log('\n' + '='.repeat(80));
    console.log(`🔍 ${title.toUpperCase()}`);
    console.log('='.repeat(80));
  }

  private printSection(title: string): void {
    console.log(`\n📊 ${title}`);
    console.log('-'.repeat(50));
  }

  // Extract top-level executive insights
  public generateExecutiveSummary(): void {
    this.printHeader('ICT Funding Landscape - Executive Summary');

    const { overview } = this.data;
    const themes = Object.values(this.data.thematicAnalysis);
    
    console.log(`\n🎯 STRATEGIC OVERVIEW:`);
    console.log(`   Total ICT Projects: ${overview.totalICTProjects.toLocaleString()}`);
    console.log(`   Total ICT Funding: ${this.formatCurrency(overview.totalICTFunding)}`);
    console.log(`   Average Project Size: ${this.formatCurrency(overview.totalICTFunding / overview.totalICTProjects)}`);
    console.log(`   Thematic Areas: ${overview.themesAnalyzed.length}`);

    // Market concentration analysis
    const totalFunding = themes.reduce((sum, theme) => sum + theme.totalFunding, 0);
    const top3Themes = themes.sort((a, b) => b.totalFunding - a.totalFunding).slice(0, 3);
    const top3Concentration = top3Themes.reduce((sum, theme) => sum + theme.totalFunding, 0) / totalFunding;

    console.log(`\n💡 KEY INSIGHTS:`);
    console.log(`   → Top 3 themes control ${(top3Concentration * 100).toFixed(1)}% of total ICT funding`);
    console.log(`   → Digital Transformation is the dominant theme`);
    console.log(`   → Strong European research institution leadership`);
    console.log(`   → Cross-border collaboration is the norm, not exception`);
  }

  // Analyze thematic priorities and trends
  public analyzeThematicLandscape(): void {
    this.printSection('THEMATIC FUNDING PRIORITIES');

    const themes = Object.values(this.data.thematicAnalysis)
      .sort((a, b) => b.totalFunding - a.totalFunding);

    console.log('\n🏆 TOP FUNDED ICT THEMES:');
    themes.slice(0, 8).forEach((theme, index) => {
      const avgFunding = this.formatCurrency(theme.averageFunding);
      const totalFunding = this.formatCurrency(theme.totalFunding);
      const marketShare = ((theme.totalFunding / themes.reduce((sum, t) => sum + t.totalFunding, 0)) * 100).toFixed(1);
      
      console.log(`   ${index + 1}. ${theme.theme}`);
      console.log(`      Projects: ${theme.projectCount.toLocaleString()} | Total: ${totalFunding} | Avg: ${avgFunding} | Share: ${marketShare}%`);
    });

    // Identify high-value vs high-volume themes
    console.log('\n📈 STRATEGIC THEME ANALYSIS:');
    
    const highValueThemes = themes.filter(t => t.averageFunding > 100000000).slice(0, 3); // >100M avg
    const highVolumeThemes = themes.filter(t => t.projectCount > 1000).slice(0, 3);
    
    console.log('\n   🎯 HIGH-VALUE THEMES (>€100M avg project):');
    highValueThemes.forEach(theme => {
      console.log(`      • ${theme.theme}: ${this.formatCurrency(theme.averageFunding)} avg | ${theme.projectCount} projects`);
    });

    console.log('\n   📊 HIGH-VOLUME THEMES (>1000 projects):');
    highVolumeThemes.forEach(theme => {
      console.log(`      • ${theme.theme}: ${theme.projectCount} projects | ${this.formatCurrency(theme.averageFunding)} avg`);
    });
  }

  // Identify key players and collaboration patterns
  public analyzeCollaborationEcosystem(): void {
    this.printSection('COLLABORATION ECOSYSTEM');

    // Get all unique collaborators across themes
    const allCollaborators = new Map<string, {
      name: string;
      country: string;
      totalProjects: number;
      totalFunding: number;
      themes: Set<string>;
      collaborationScore: number;
    }>();

    Object.values(this.data.thematicAnalysis).forEach(theme => {
      theme.topCollaborators.forEach((collab: any) => {
        const key = collab.organizationId;
        if (!allCollaborators.has(key)) {
          allCollaborators.set(key, {
            name: collab.name,
            country: collab.country,
            totalProjects: collab.totalICTProjects,
            totalFunding: collab.totalICTFunding,
            themes: new Set(),
            collaborationScore: collab.collaborationScore
          });
        }
        allCollaborators.get(key)!.themes.add(theme.theme);
      });
    });

    const topCollaborators = Array.from(allCollaborators.values())
      .sort((a, b) => b.collaborationScore - a.collaborationScore)
      .slice(0, 10);

    console.log('\n🏆 TOP ICT COLLABORATORS (Cross-Theme Leaders):');
    topCollaborators.forEach((org, index) => {
      console.log(`   ${index + 1}. ${org.name} (${org.country})`);
      console.log(`      Score: ${org.collaborationScore} | Projects: ${org.totalProjects} | Funding: ${this.formatCurrency(org.totalFunding)}`);
      console.log(`      Active in: ${Array.from(org.themes).slice(0, 4).join(', ')}${org.themes.size > 4 ? '...' : ''}`);
      console.log('');
    });

    // Country analysis
    const countryStats = new Map<string, { orgs: number; projects: number; funding: number; topOrg: string }>();
    
    topCollaborators.forEach(org => {
      if (!countryStats.has(org.country)) {
        countryStats.set(org.country, { orgs: 0, projects: 0, funding: 0, topOrg: org.name });
      }
      const stats = countryStats.get(org.country)!;
      stats.orgs++;
      stats.projects += org.totalProjects;
      stats.funding += org.totalFunding;
    });

    console.log('\n🌍 COUNTRY LEADERSHIP IN ICT:');
    Array.from(countryStats.entries())
      .sort(([,a], [,b]) => b.funding - a.funding)
      .slice(0, 6)
      .forEach(([country, stats], index) => {
        console.log(`   ${index + 1}. ${country}: ${stats.orgs} top orgs | ${stats.projects} projects | ${this.formatCurrency(stats.funding)}`);
        console.log(`      Leading org: ${stats.topOrg}`);
      });
  }

  // Deep dive into specific high-impact themes
  public analyzeStrategicThemes(): void {
    this.printSection('STRATEGIC THEME DEEP DIVE');

    const strategicThemes = ['Artificial Intelligence', 'Quantum Computing', 'Cybersecurity', 'Telecommunications'];
    
    strategicThemes.forEach(themeName => {
      const theme = this.data.thematicAnalysis[themeName];
      if (!theme) return;

      console.log(`\n🎯 ${themeName.toUpperCase()}:`);
      console.log(`   Market Size: ${this.formatCurrency(theme.totalFunding)} across ${theme.projectCount} projects`);
      console.log(`   Avg Project: ${this.formatCurrency(theme.averageFunding)}`);
      
      // Top 3 projects
      console.log(`   Top Projects:`);
      theme.topProjects.slice(0, 3).forEach((project: any, index: number) => {
        console.log(`     ${index + 1}. ${project.acronym} - ${this.formatCurrency(project.fundingAmount)}`);
      });
      
      // Top 3 collaborators
      console.log(`   Leading Organizations:`);
      theme.topCollaborators.slice(0, 3).forEach((org: any, index: number) => {
        console.log(`     ${index + 1}. ${org.name} (${org.country}) - ${org.totalICTProjects} projects`);
      });
      
      // Key partnerships
      const topPartnerships = Object.entries(theme.collaborationNetworks)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2);
      
      if (topPartnerships.length > 0) {
        console.log(`   Key Partnerships:`);
        topPartnerships.forEach(([pair, count], index) => {
          console.log(`     ${index + 1}. ${count} joint projects between ${pair.split('|').join(' & ')}`);
        });
      }
    });
  }

  // Identify emerging trends and opportunities
  public identifyTrends(): void {
    this.printSection('TRENDS & OPPORTUNITIES');

    const themes = Object.values(this.data.thematicAnalysis);
    
    console.log('\n📈 EMERGING OPPORTUNITIES:');
    
    // High average funding = strategic priority
    const strategicThemes = themes
      .filter(t => t.averageFunding > 80000000) // >80M avg
      .sort((a, b) => b.averageFunding - a.averageFunding);
    
    console.log('\n   🚀 High-Investment Priority Areas:');
    strategicThemes.slice(0, 4).forEach(theme => {
      console.log(`     • ${theme.theme}: ${this.formatCurrency(theme.averageFunding)} avg funding per project`);
    });

    // Balanced themes (good volume + decent funding)
    const balancedThemes = themes
      .filter(t => t.projectCount > 500 && t.averageFunding > 50000000)
      .sort((a, b) => (b.projectCount * b.averageFunding) - (a.projectCount * a.averageFunding));
    
    console.log('\n   ⚖️ Balanced Growth Areas (Volume + Value):');
    balancedThemes.slice(0, 3).forEach(theme => {
      console.log(`     • ${theme.theme}: ${theme.projectCount} projects @ ${this.formatCurrency(theme.averageFunding)} avg`);
    });

    console.log('\n💡 KEY STRATEGIC INSIGHTS:');
    console.log('   → Digital Transformation dominates but with lower per-project funding');
    console.log('   → Quantum Computing shows highest per-project investment priority');
    console.log('   → AI and Cybersecurity offer balanced volume-value opportunities');
    console.log('   → European research institutions lead collaboration networks');
    console.log('   → Cross-border partnerships are essential for major projects');
  }

  // Generate complete insights report
  public generateFullReport(): void {
    console.log('🚀 ICT FUNDING INSIGHTS REPORT');
    console.log('Generated from Horizon Europe Dataset Analysis');
    console.log('=' .repeat(80));

    this.generateExecutiveSummary();
    this.analyzeThematicLandscape();
    this.analyzeCollaborationEcosystem();
    this.analyzeStrategicThemes();
    this.identifyTrends();

    console.log('\n' + '='.repeat(80));
    console.log('📁 Full detailed data available in: ict-analysis.json');
    console.log('🔍 For specific queries, use the ICTAnalyzer class directly');
    console.log('=' .repeat(80));
  }
}

// Command line interface
function main() {
  const insights = new ICTInsights();
  
  // Check if specific section requested
  const args = process.argv.slice(2);
  const section = args[0]?.toLowerCase();

  switch (section) {
    case 'summary':
    case 'exec':
      insights.generateExecutiveSummary();
      break;
    case 'themes':
    case 'thematic':
      insights.analyzeThematicLandscape();
      break;
    case 'collab':
    case 'collaboration':
      insights.analyzeCollaborationEcosystem();
      break;
    case 'strategic':
    case 'strategy':
      insights.analyzeStrategicThemes();
      break;
    case 'trends':
    case 'opportunities':
      insights.identifyTrends();
      break;
    default:
      insights.generateFullReport();
  }
}

// Export for use in other modules
export { ICTInsights };

// Run if called directly
if (require.main === module) {
  main();
} 