import * as fs from 'fs';
import * as path from 'path';

// Type definitions for the data structures
interface Project {
  id: string;
  acronym: string;
  status: string;
  title: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  ecMaxContribution: number;
  legalBasis: string;
  topics: string;
  objective: string;
  frameworkProgramme: string;
  fundingScheme: string;
}

interface Organization {
  projectID: string;
  projectAcronym: string;
  organisationID: string;
  name: string;
  shortName: string;
  SME: boolean;
  activityType: string;
  country: string;
  role: string;
  ecContribution: number;
  totalCost: number;
  active: boolean;
}

interface Topic {
  projectID: string;
  topic: string;
  title: string;
}

interface PolicyPriority {
  projectID: string;
  ai: number;
  biodiversity: number;
  cleanAir: number;
  climate: number;
  digitalAgenda: number;
}

interface ProjectInsight {
  projectId: string;
  acronym: string;
  fullTitle: string;
  keyThemes: string[];
  description: string;
  fundingAmount: number;
  topics: string[];
  policyPriorities: { [key: string]: number };
}

interface OrganizationProwess {
  organizationId: string;
  name: string;
  shortName: string;
  country: string;
  totalProjects: number;
  totalFunding: number;
  averageFundingPerProject: number;
  smeStatus: boolean;
  activityTypes: string[];
  leadershipRoles: number;
  participationRoles: number;
  prowessScore: number;
  specializations: string[];
}

class CSVAnalyzer {
  private dataPath: string;

  constructor(dataPath: string = './data') {
    this.dataPath = dataPath;
  }

  // Utility function to parse CSV with semicolon separator
  private parseCSV(content: string): any[] {
    const lines = content.trim().split('\n');
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(';').map(h => h.replace(/"/g, ''));
    const data: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }
    
    return data;
  }

  // Parse a single CSV line handling quoted fields with semicolons
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ';' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  // Load and parse project data
  protected loadProjects(): Project[] {
    try {
      const content = fs.readFileSync(path.join(this.dataPath, 'project.csv'), 'utf-8');
      const rawData = this.parseCSV(content);
      
      return rawData.map(row => ({
        id: row.id,
        acronym: row.acronym,
        status: row.status,
        title: row.title,
        startDate: row.startDate,
        endDate: row.endDate,
        totalCost: parseFloat(row.totalCost?.replace(/,/g, '') || '0'),
        ecMaxContribution: parseFloat(row.ecMaxContribution?.replace(/,/g, '') || '0'),
        legalBasis: row.legalBasis,
        topics: row.topics,
        objective: row.objective,
        frameworkProgramme: row.frameworkProgramme,
        fundingScheme: row.fundingScheme
      }));
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  // Load and parse organization data
  protected loadOrganizations(): Organization[] {
    try {
      const content = fs.readFileSync(path.join(this.dataPath, 'organization.csv'), 'utf-8');
      const rawData = this.parseCSV(content);
      
      return rawData.map(row => ({
        projectID: row.projectID,
        projectAcronym: row.projectAcronym,
        organisationID: row.organisationID,
        name: row.name,
        shortName: row.shortName,
        SME: row.SME === 'true',
        activityType: row.activityType,
        country: row.country,
        role: row.role,
        ecContribution: parseFloat(row.ecContribution?.replace(/,/g, '') || '0'),
        totalCost: parseFloat(row.totalCost?.replace(/,/g, '') || '0'),
        active: row.active !== 'false'
      }));
    } catch (error) {
      console.error('Error loading organizations:', error);
      return [];
    }
  }

  // Load and parse topics data
  protected loadTopics(): Topic[] {
    try {
      const content = fs.readFileSync(path.join(this.dataPath, 'topics.csv'), 'utf-8');
      const rawData = this.parseCSV(content);
      
      return rawData.map(row => ({
        projectID: row.projectID,
        topic: row.topic,
        title: row.title
      }));
    } catch (error) {
      console.error('Error loading topics:', error);
      return [];
    }
  }

  // Load and parse policy priorities data
  protected loadPolicyPriorities(): PolicyPriority[] {
    try {
      const content = fs.readFileSync(path.join(this.dataPath, 'policyPriorities.csv'), 'utf-8');
      const rawData = this.parseCSV(content);
      
      return rawData.map(row => ({
        projectID: row.projectID,
        ai: parseInt(row.ai) || 0,
        biodiversity: parseInt(row.biodiversity) || 0,
        cleanAir: parseInt(row.cleanAir) || 0,
        climate: parseInt(row.climate) || 0,
        digitalAgenda: parseInt(row.digitalAgenda) || 0
      }));
    } catch (error) {
      console.error('Error loading policy priorities:', error);
      return [];
    }
  }

  // Extract key themes and topics from project text
  private extractKeyThemes(title: string, objective: string): string[] {
    const text = `${title} ${objective}`.toLowerCase();
    const themes: string[] = [];
    
    // Technology themes
    const techKeywords = [
      'artificial intelligence', 'ai', 'machine learning', 'digital', 'data',
      'blockchain', 'iot', 'internet of things', 'automation', 'robotics',
      'cybersecurity', 'cloud', 'quantum', '5g', '6g'
    ];
    
    // Environmental themes
    const envKeywords = [
      'climate', 'carbon', 'renewable', 'energy', 'sustainable', 'green',
      'biodiversity', 'environment', 'clean', 'emission', 'solar', 'wind'
    ];
    
    // Research themes
    const researchKeywords = [
      'innovation', 'research', 'development', 'breakthrough', 'advanced',
      'novel', 'cutting-edge', 'pioneering', 'experimental'
    ];
    
    // Healthcare themes
    const healthKeywords = [
      'health', 'medical', 'pharmaceutical', 'drug', 'treatment', 'therapy',
      'disease', 'cancer', 'diagnosis', 'clinical'
    ];
    
    [
      ...techKeywords.map(k => ({ keyword: k, theme: 'Technology' })),
      ...envKeywords.map(k => ({ keyword: k, theme: 'Environment' })),
      ...researchKeywords.map(k => ({ keyword: k, theme: 'Research' })),
      ...healthKeywords.map(k => ({ keyword: k, theme: 'Healthcare' }))
    ].forEach(({ keyword, theme }) => {
      if (text.includes(keyword) && !themes.includes(theme)) {
        themes.push(theme);
      }
    });
    
    return themes;
  }

  // Calculate organization prowess score
  private calculateProwessScore(
    totalProjects: number,
    totalFunding: number,
    averageFunding: number,
    leadershipRoles: number,
    country: string,
    activityTypes: string[]
  ): number {
    let score = 0;
    
    // Project volume score (0-30 points)
    score += Math.min(totalProjects * 2, 30);
    
    // Funding score (0-25 points)
    score += Math.min(totalFunding / 1000000, 25); // Per million euros
    
    // Average funding per project (0-20 points) 
    score += Math.min(averageFunding / 100000, 20); // Per 100k euros
    
    // Leadership score (0-15 points)
    score += Math.min(leadershipRoles * 5, 15);
    
    // Country/region bonus (0-10 points)
    const topCountries = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'SE', 'DK'];
    if (topCountries.includes(country)) {
      score += 5;
    }
    
    // Activity type diversity bonus (0-10 points)
    score += Math.min(activityTypes.length * 2, 10);
    
    return Math.round(score);
  }

  // Analyze project titles and descriptive content
  public analyzeProjects(): ProjectInsight[] {
    const projects = this.loadProjects();
    const topics = this.loadTopics();
    const policyPriorities = this.loadPolicyPriorities();
    
    // Create lookup maps
    const topicsMap = new Map<string, string[]>();
    topics.forEach(topic => {
      if (!topicsMap.has(topic.projectID)) {
        topicsMap.set(topic.projectID, []);
      }
      topicsMap.get(topic.projectID)!.push(topic.title);
    });
    
    const prioritiesMap = new Map<string, PolicyPriority>();
    policyPriorities.forEach(priority => {
      prioritiesMap.set(priority.projectID, priority);
    });
    
    return projects.map(project => {
      const keyThemes = this.extractKeyThemes(project.title, project.objective);
      const projectTopics = topicsMap.get(project.id) || [];
      const priorities = prioritiesMap.get(project.id);
      
      return {
        projectId: project.id,
        acronym: project.acronym,
        fullTitle: project.title,
        keyThemes,
        description: project.objective.substring(0, 500) + '...', // Truncate for readability
        fundingAmount: project.ecMaxContribution,
        topics: projectTopics,
        policyPriorities: priorities ? {
          ai: priorities.ai,
          biodiversity: priorities.biodiversity,
          cleanAir: priorities.cleanAir,
          climate: priorities.climate,
          digitalAgenda: priorities.digitalAgenda
        } : {
          ai: 0,
          biodiversity: 0,
          cleanAir: 0,
          climate: 0,
          digitalAgenda: 0
        }
      };
    });
  }

  // Analyze organization prowess in grants
  public analyzeOrganizationProwess(): OrganizationProwess[] {
    const organizations = this.loadOrganizations();
    const topics = this.loadTopics();
    
    // Group organizations by ID
    const orgMap = new Map<string, Organization[]>();
    organizations.forEach(org => {
      if (!orgMap.has(org.organisationID)) {
        orgMap.set(org.organisationID, []);
      }
      orgMap.get(org.organisationID)!.push(org);
    });
    
    // Create topic specialization map
    const topicMap = new Map<string, string[]>();
    topics.forEach(topic => {
      if (!topicMap.has(topic.projectID)) {
        topicMap.set(topic.projectID, []);
      }
      topicMap.get(topic.projectID)!.push(topic.title);
    });
    
    const prowessResults: OrganizationProwess[] = [];
    
    orgMap.forEach((orgProjects, orgId) => {
      const representative = orgProjects[0]; // Use first occurrence for basic info
      
      const totalProjects = orgProjects.length;
      const totalFunding = orgProjects.reduce((sum, org) => sum + org.ecContribution, 0);
      const averageFunding = totalFunding / totalProjects;
      
      const leadershipRoles = orgProjects.filter(org => 
        org.role.toLowerCase().includes('coordinator') || 
        org.role.toLowerCase().includes('leader')
      ).length;
      
      const participationRoles = totalProjects - leadershipRoles;
      
      const activityTypes = [...new Set(orgProjects.map(org => org.activityType))];
      
      // Get specializations based on project topics
      const allTopics: string[] = [];
      orgProjects.forEach(org => {
        const projectTopics = topicMap.get(org.projectID) || [];
        allTopics.push(...projectTopics);
      });
      
      const topicCounts = new Map<string, number>();
      allTopics.forEach(topic => {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      });
      
      const specializations = Array.from(topicCounts.entries())
        .filter(([_, count]) => count >= 2) // Appeared in at least 2 projects
        .sort(([_, a], [__, b]) => b - a) // Sort by frequency
        .slice(0, 5) // Top 5 specializations
        .map(([topic, _]) => topic);
      
      const prowessScore = this.calculateProwessScore(
        totalProjects,
        totalFunding,
        averageFunding,
        leadershipRoles,
        representative.country,
        activityTypes
      );
      
      prowessResults.push({
        organizationId: orgId,
        name: representative.name,
        shortName: representative.shortName,
        country: representative.country,
        totalProjects,
        totalFunding,
        averageFundingPerProject: averageFunding,
        smeStatus: representative.SME,
        activityTypes,
        leadershipRoles,
        participationRoles,
        prowessScore,
        specializations
      });
    });
    
    // Sort by prowess score (highest first)
    return prowessResults.sort((a, b) => b.prowessScore - a.prowessScore);
  }

  // Generate comprehensive analysis report
  public generateAnalysisReport(): void {
    console.log('🚀 Starting Horizon Europe Data Analysis...\n');
    
    // Analyze projects
    console.log('📊 Analyzing Projects...');
    const projectInsights = this.analyzeProjects();
    
    // Analyze organizations
    console.log('🏢 Analyzing Organizations...');
    const organizationProwess = this.analyzeOrganizationProwess();
    
    // Generate summary statistics
    console.log('\n📈 ANALYSIS SUMMARY');
    console.log('===================');
    console.log(`Total Projects Analyzed: ${projectInsights.length}`);
    console.log(`Total Organizations Analyzed: ${organizationProwess.length}`);
    
    // Top project themes
    const themeCount = new Map<string, number>();
    projectInsights.forEach(project => {
      project.keyThemes.forEach(theme => {
        themeCount.set(theme, (themeCount.get(theme) || 0) + 1);
      });
    });
    
    console.log('\n🎯 TOP PROJECT THEMES:');
    Array.from(themeCount.entries())
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 10)
      .forEach(([theme, count]) => {
        console.log(`  ${theme}: ${count} projects`);
      });
    
    // Top funded projects
    console.log('\n💰 TOP FUNDED PROJECTS:');
    projectInsights
      .sort((a, b) => b.fundingAmount - a.fundingAmount)
      .slice(0, 5)
      .forEach(project => {
        console.log(`  ${project.acronym}: €${project.fundingAmount.toLocaleString()} - ${project.fullTitle}`);
      });
    
    // Top performing organizations
    console.log('\n🏆 TOP PERFORMING ORGANIZATIONS:');
    organizationProwess
      .slice(0, 10)
      .forEach((org, index) => {
        console.log(`  ${index + 1}. ${org.name} (${org.country})`);
        console.log(`     Prowess Score: ${org.prowessScore}`);
        console.log(`     Projects: ${org.totalProjects}, Funding: €${org.totalFunding.toLocaleString()}`);
        console.log(`     Specializations: ${org.specializations.slice(0, 3).join(', ')}`);
        console.log('');
      });
    
    // Save detailed results to JSON files
    fs.writeFileSync('project-insights.json', JSON.stringify(projectInsights, null, 2));
    fs.writeFileSync('organization-prowess.json', JSON.stringify(organizationProwess, null, 2));
    
    console.log('📁 Detailed results saved to:');
    console.log('  - project-insights.json');
    console.log('  - organization-prowess.json');
  }
}

// Export the analyzer class and types
export {
  CSVAnalyzer,
  Project,
  Organization,
  Topic,
  PolicyPriority,
  ProjectInsight,
  OrganizationProwess
};

// If running directly, execute the analysis
if (require.main === module) {
  const analyzer = new CSVAnalyzer();
  analyzer.generateAnalysisReport();
}