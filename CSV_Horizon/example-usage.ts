import { CSVAnalyzer, ProjectInsight } from './csv-analyzer';

// Example usage of the CSV Analyzer
class ExampleUsage {
  private analyzer: CSVAnalyzer;

  constructor() {
    this.analyzer = new CSVAnalyzer('./data');
  }

  // Example 1: Find AI-focused projects
  async findAIProjects(): Promise<void> {
    console.log('\n🤖 Finding AI-Focused Projects...\n');
    
    const projects = this.analyzer.analyzeProjects();
    const aiProjects = projects.filter(project => 
      project.keyThemes.includes('Technology') && 
      (project.fullTitle.toLowerCase().includes('artificial intelligence') ||
       project.fullTitle.toLowerCase().includes('ai') ||
       project.description.toLowerCase().includes('artificial intelligence') ||
       project.policyPriorities.ai > 50)
    );

    console.log(`Found ${aiProjects.length} AI-focused projects:\n`);
    
    aiProjects.slice(0, 10).forEach((project, index) => {
      console.log(`${index + 1}. ${project.acronym}: ${project.fullTitle}`);
      console.log(`   Funding: €${project.fundingAmount.toLocaleString()}`);
      console.log(`   AI Priority Score: ${project.policyPriorities.ai || 'N/A'}`);
      console.log(`   Themes: ${project.keyThemes.join(', ')}`);
      console.log('');
    });
  }

  // Example 2: Find top German organizations
  async findTopGermanOrganizations(): Promise<void> {
    console.log('\n🇩🇪 Finding Top German Organizations...\n');
    
    const organizations = this.analyzer.analyzeOrganizationProwess();
    const germanOrgs = organizations.filter(org => org.country === 'DE');

    console.log(`Found ${germanOrgs.length} German organizations:\n`);
    
    germanOrgs.slice(0, 10).forEach((org, index) => {
      console.log(`${index + 1}. ${org.name}`);
      console.log(`   Prowess Score: ${org.prowessScore}`);
      console.log(`   Total Projects: ${org.totalProjects}`);
      console.log(`   Total Funding: €${org.totalFunding.toLocaleString()}`);
      console.log(`   SME Status: ${org.smeStatus ? 'Yes' : 'No'}`);
      console.log(`   Top Specializations: ${org.specializations.slice(0, 3).join(', ')}`);
      console.log('');
    });
  }

  // Example 3: Find climate-related projects with high funding
  async findHighFundedClimateProjects(): Promise<void> {
    console.log('\n🌍 Finding High-Funded Climate Projects...\n');
    
    const projects = this.analyzer.analyzeProjects();
    const climateProjects = projects.filter(project => 
      project.keyThemes.includes('Environment') && 
      project.fundingAmount > 1000000 && // > 1M euros
      (project.policyPriorities.climate > 40 || 
       project.fullTitle.toLowerCase().includes('climate') ||
       project.fullTitle.toLowerCase().includes('green') ||
       project.fullTitle.toLowerCase().includes('sustainable'))
    );

    console.log(`Found ${climateProjects.length} high-funded climate projects:\n`);
    
    climateProjects
      .sort((a, b) => b.fundingAmount - a.fundingAmount)
      .slice(0, 10)
      .forEach((project, index) => {
        console.log(`${index + 1}. ${project.acronym}: ${project.fullTitle}`);
        console.log(`   Funding: €${project.fundingAmount.toLocaleString()}`);
        console.log(`   Climate Priority Score: ${project.policyPriorities.climate || 'N/A'}`);
        console.log(`   Topics: ${project.topics.slice(0, 2).join(', ')}`);
        console.log('');
      });
  }

  // Example 4: Organization collaboration analysis
  async analyzeOrganizationCollaboration(): Promise<void> {
    console.log('\n🤝 Analyzing Organization Collaboration Patterns...\n');
    
    const organizations = this.analyzer.analyzeOrganizationProwess();
    
    // Find organizations with high leadership vs participation ratios
    const leaders = organizations.filter(org => 
      org.leadershipRoles > 0 && 
      (org.leadershipRoles / org.totalProjects) > 0.3
    );

    console.log(`Organizations with strong leadership presence (>30% leadership ratio):\n`);
    
    leaders
      .sort((a, b) => (b.leadershipRoles / b.totalProjects) - (a.leadershipRoles / a.totalProjects))
      .slice(0, 10)
      .forEach((org, index) => {
        const leadershipRatio = ((org.leadershipRoles / org.totalProjects) * 100).toFixed(1);
        console.log(`${index + 1}. ${org.name} (${org.country})`);
        console.log(`   Leadership Ratio: ${leadershipRatio}%`);
        console.log(`   Leadership Roles: ${org.leadershipRoles}`);
        console.log(`   Total Projects: ${org.totalProjects}`);
        console.log(`   Average Funding per Project: €${org.averageFundingPerProject.toLocaleString()}`);
        console.log('');
      });
  }

  // Example 5: Cross-theme project analysis
  async analyzeCrossThemeProjects(): Promise<void> {
    console.log('\n🔗 Analyzing Cross-Theme Projects...\n');
    
    const projects = this.analyzer.analyzeProjects();
    const multiThemeProjects = projects.filter(project => project.keyThemes.length >= 2);

    console.log(`Found ${multiThemeProjects.length} projects spanning multiple themes:\n`);

    // Group by theme combinations
    const themeCombinations = new Map<string, ProjectInsight[]>();
    
    multiThemeProjects.forEach(project => {
      const themeKey = project.keyThemes.sort().join(' + ');
      if (!themeCombinations.has(themeKey)) {
        themeCombinations.set(themeKey, []);
      }
      themeCombinations.get(themeKey)!.push(project);
    });

    // Show most common theme combinations
    const sortedCombinations = Array.from(themeCombinations.entries())
      .sort(([_, a], [__, b]) => b.length - a.length)
      .slice(0, 10);

    console.log('Most common theme combinations:\n');
    sortedCombinations.forEach(([combination, projects], index) => {
      const avgFunding = projects.reduce((sum, p) => sum + p.fundingAmount, 0) / projects.length;
      console.log(`${index + 1}. ${combination}`);
      console.log(`   Projects: ${projects.length}`);
      console.log(`   Average Funding: €${avgFunding.toLocaleString()}`);
      console.log(`   Example: ${projects[0].acronym} - ${projects[0].fullTitle}`);
      console.log('');
    });
  }

  // Run all examples
  async runAllExamples(): Promise<void> {
    console.log('🎯 Running CSV Horizon Analyzer Examples\n');
    console.log('=' .repeat(50));

    try {
      await this.findAIProjects();
      await this.findTopGermanOrganizations();
      await this.findHighFundedClimateProjects();
      await this.analyzeOrganizationCollaboration();
      await this.analyzeCrossThemeProjects();
      
      console.log('\n✅ All examples completed successfully!');
    } catch (error) {
      console.error('❌ Error running examples:', error);
    }
  }
}

// Export for use in other files
export { ExampleUsage };

// If running directly, execute all examples
if (require.main === module) {
  const example = new ExampleUsage();
  example.runAllExamples();
} 