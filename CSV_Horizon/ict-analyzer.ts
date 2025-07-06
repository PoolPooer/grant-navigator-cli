import { CSVAnalyzer, Organization, PolicyPriority } from './csv-analyzer';

// ICT-specific interfaces
interface ICTProject {
  projectId: string;
  acronym: string;
  fullTitle: string;
  description: string;
  fundingAmount: number;
  ictThemes: string[];
  digitalAgendaScore: number;
  aiScore: number;
  topics: string[];
  organizations: string[]; // Organization IDs
}

interface ICTCollaborator {
  organizationId: string;
  name: string;
  shortName: string;
  country: string;
  ictThemes: string[];
  totalICTProjects: number;
  totalICTFunding: number;
  leadershipRoles: number;
  collaborationScore: number;
  topPartners: { orgId: string; name: string; projectCount: number }[];
}

interface ThematicAnalysis {
  theme: string;
  projectCount: number;
  totalFunding: number;
  averageFunding: number;
  topProjects: ICTProject[];
  topCollaborators: ICTCollaborator[];
  collaborationNetworks: { [key: string]: number };
}

class ICTAnalyzer extends CSVAnalyzer {
  private ictKeywords = {
    'Artificial Intelligence': [
      'artificial intelligence', 'ai ', 'machine learning', 'deep learning', 
      'neural network', 'computer vision', 'natural language processing', 
      'nlp', 'robotics', 'autonomous', 'intelligent systems'
    ],
    'Quantum Computing': [
      'quantum', 'quantum computing', 'quantum communication', 
      'quantum cryptography', 'quantum algorithms', 'qubits'
    ],
    'Telecommunications': [
      '5g', '6g', 'telecommunications', 'telco', 'mobile networks', 
      'wireless', 'network infrastructure', 'connectivity', 'broadband'
    ],
    'Cybersecurity': [
      'cybersecurity', 'cyber security', 'information security', 
      'data protection', 'privacy', 'encryption', 'cryptography', 
      'security', 'cyber attack', 'cyber defence'
    ],
    'Internet of Things': [
      'iot', 'internet of things', 'smart devices', 'connected devices', 
      'sensor networks', 'smart cities', 'smart home', 'edge computing'
    ],
    'Cloud Computing': [
      'cloud computing', 'cloud services', 'distributed computing', 
      'virtualization', 'containerization', 'microservices', 'serverless'
    ],
    'Data Science': [
      'big data', 'data analytics', 'data science', 'data mining', 
      'business intelligence', 'data visualization', 'data management'
    ],
    'Blockchain': [
      'blockchain', 'distributed ledger', 'cryptocurrency', 'smart contracts', 
      'decentralized', 'web3', 'defi'
    ],
    'Software Engineering': [
      'software development', 'software engineering', 'agile', 'devops', 
      'software architecture', 'programming', 'coding', 'application'
    ],
    'Digital Transformation': [
      'digital transformation', 'digitalization', 'digitization', 
      'digital services', 'e-government', 'digital economy', 'platform'
    ]
  };

  // Identify ICT projects using comprehensive criteria
  private identifyICTProjects(): ICTProject[] {
    const projects = this.loadProjects();
    const topics = this.loadTopics();
    const priorities = this.loadPolicyPriorities();
    const organizations = this.loadOrganizations();

    // Create lookup maps
    const topicsMap = new Map<string, string[]>();
    topics.forEach(topic => {
      if (!topicsMap.has(topic.projectID)) {
        topicsMap.set(topic.projectID, []);
      }
      topicsMap.get(topic.projectID)!.push(topic.title);
    });

    const prioritiesMap = new Map<string, PolicyPriority>();
    priorities.forEach(priority => {
      prioritiesMap.set(priority.projectID, priority);
    });

    const orgMap = new Map<string, string[]>();
    organizations.forEach(org => {
      if (!orgMap.has(org.projectID)) {
        orgMap.set(org.projectID, []);
      }
      orgMap.get(org.projectID)!.push(org.organisationID);
    });

    const ictProjects: ICTProject[] = [];

    projects.forEach(project => {
      const projectText = `${project.title} ${project.objective}`.toLowerCase();
      const projectTopics = topicsMap.get(project.id) || [];
      const projectPriorities = prioritiesMap.get(project.id);
      const projectOrgs = orgMap.get(project.id) || [];

      // Check if project is ICT-related
      const ictThemes: string[] = [];
      let isICTProject = false;

      // 1. Keyword-based detection
      Object.entries(this.ictKeywords).forEach(([theme, keywords]) => {
        const hasTheme = keywords.some(keyword => 
          projectText.includes(keyword.toLowerCase())
        );
        if (hasTheme) {
          ictThemes.push(theme);
          isICTProject = true;
        }
      });

      // 2. Topic-based detection
      const ictTopicKeywords = [
        'digital', 'cyber', 'quantum', 'artificial intelligence', 'ai',
        'software', 'ict', 'computing', 'network', 'data', 'algorithm'
      ];
      
      const hasICTTopic = projectTopics.some(topic =>
        ictTopicKeywords.some(keyword => 
          topic.toLowerCase().includes(keyword)
        )
      );

      if (hasICTTopic) {
        isICTProject = true;
      }

      // 3. Policy priority-based detection (high digital agenda or AI scores)
      const digitalScore = projectPriorities?.digitalAgenda || 0;
      const aiScore = projectPriorities?.ai || 0;
      
      if (digitalScore >= 40 || aiScore >= 40) {
        isICTProject = true;
      }

      // 4. Framework program detection (specific ICT programs)
      const ictPrograms = ['DIGITAL', 'EIC', 'MSCA'];
      if (ictPrograms.some(prog => project.frameworkProgramme.includes(prog))) {
        isICTProject = true;
      }

      if (isICTProject) {
        ictProjects.push({
          projectId: project.id,
          acronym: project.acronym,
          fullTitle: project.title,
          description: project.objective.substring(0, 300) + '...',
          fundingAmount: project.ecMaxContribution,
          ictThemes: ictThemes.length > 0 ? ictThemes : ['Digital Transformation'],
          digitalAgendaScore: digitalScore,
          aiScore: aiScore,
          topics: projectTopics,
          organizations: projectOrgs
        });
      }
    });

    return ictProjects;
  }

  // Analyze ICT collaborators
  private analyzeICTCollaborators(ictProjects: ICTProject[]): ICTCollaborator[] {
    const organizations = this.loadOrganizations();
    
    // Create organization lookup
    const orgDetails = new Map<string, Organization>();
    organizations.forEach(org => {
      orgDetails.set(org.organisationID, org);
    });

    // Track ICT participation per organization
    const orgICTData = new Map<string, {
      projects: Set<string>;
      themes: Set<string>;
      funding: number;
      leadership: number;
      partners: Map<string, number>;
    }>();

    // Process each ICT project
    ictProjects.forEach(project => {
      const projectOrgs = organizations.filter(org => org.projectID === project.projectId);
      
      projectOrgs.forEach(org => {
        if (!orgICTData.has(org.organisationID)) {
          orgICTData.set(org.organisationID, {
            projects: new Set(),
            themes: new Set(),
            funding: 0,
            leadership: 0,
            partners: new Map()
          });
        }

        const data = orgICTData.get(org.organisationID)!;
        data.projects.add(project.projectId);
        project.ictThemes.forEach(theme => data.themes.add(theme));
        data.funding += org.ecContribution;
        
        if (org.role.toLowerCase().includes('coordinator') || 
            org.role.toLowerCase().includes('leader')) {
          data.leadership++;
        }

        // Track partnerships
        projectOrgs.forEach(partner => {
          if (partner.organisationID !== org.organisationID) {
            const count = data.partners.get(partner.organisationID) || 0;
            data.partners.set(partner.organisationID, count + 1);
          }
        });
      });
    });

    // Create collaborator objects
    const collaborators: ICTCollaborator[] = [];
    
    orgICTData.forEach((data, orgId) => {
      const orgInfo = orgDetails.get(orgId);
      if (!orgInfo) return;

             // Calculate collaboration score
       const projectCount = data.projects.size;
       const themeCount = data.themes.size;
       const partnerCount = data.partners.size;
      
      const collaborationScore = Math.round(
        (projectCount * 2) +           // Project participation
        (data.funding / 1000000) +     // Funding scale  
        (data.leadership * 5) +        // Leadership bonus
        (themeCount * 3) +             // Theme diversity
        (partnerCount * 0.5)           // Partner network size
      );

      // Get top 5 partners
      const topPartners = Array.from(data.partners.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([partnerId, projectCount]) => {
          const partner = orgDetails.get(partnerId);
          return {
            orgId: partnerId,
            name: partner?.name || 'Unknown',
            projectCount
          };
        });

      collaborators.push({
        organizationId: orgId,
        name: orgInfo.name,
        shortName: orgInfo.shortName,
        country: orgInfo.country,
        ictThemes: Array.from(data.themes),
        totalICTProjects: projectCount,
        totalICTFunding: data.funding,
        leadershipRoles: data.leadership,
        collaborationScore,
        topPartners
      });
    });

    return collaborators.sort((a, b) => b.collaborationScore - a.collaborationScore);
  }

  // Analyze by theme
  public analyzeByTheme(topN: number = 10): { [theme: string]: ThematicAnalysis } {
    console.log('🔍 Analyzing ICT Projects by Theme...\n');
    
    const ictProjects = this.identifyICTProjects();
    const collaborators = this.analyzeICTCollaborators(ictProjects);
    
    console.log(`Found ${ictProjects.length} ICT projects\n`);

    const thematicAnalysis: { [theme: string]: ThematicAnalysis } = {};
    
    // Get all unique themes
    const allThemes = new Set<string>();
    ictProjects.forEach(project => {
      project.ictThemes.forEach(theme => allThemes.add(theme));
    });

    // Analyze each theme
    allThemes.forEach(theme => {
      const themeProjects = ictProjects.filter(project => 
        project.ictThemes.includes(theme)
      );
      
      const themeFunding = themeProjects.reduce((sum, p) => sum + p.fundingAmount, 0);
      const averageFunding = themeFunding / themeProjects.length;
      
      // Get top projects for this theme
      const topProjects = themeProjects
        .sort((a, b) => b.fundingAmount - a.fundingAmount)
        .slice(0, topN);

      // Get collaborators active in this theme
      const themeCollaborators = collaborators.filter(collab =>
        collab.ictThemes.includes(theme)
      ).slice(0, topN);

      // Calculate collaboration networks (organization co-occurrence)
      const collaborationNetworks: { [key: string]: number } = {};
      themeProjects.forEach(project => {
        const orgs = project.organizations;
        for (let i = 0; i < orgs.length; i++) {
          for (let j = i + 1; j < orgs.length; j++) {
            const pair = [orgs[i], orgs[j]].sort().join('|');
            collaborationNetworks[pair] = (collaborationNetworks[pair] || 0) + 1;
          }
        }
      });

      thematicAnalysis[theme] = {
        theme,
        projectCount: themeProjects.length,
        totalFunding: themeFunding,
        averageFunding,
        topProjects,
        topCollaborators: themeCollaborators,
        collaborationNetworks
      };
    });

    return thematicAnalysis;
  }

  // Generate ICT-focused report
  public generateICTReport(topN: number = 15): void {
    console.log('🚀 Starting ICT-Focused Analysis...\n');
    console.log('=' .repeat(60));

    const thematicAnalysis = this.analyzeByTheme(topN);
    
    // Sort themes by project count
    const sortedThemes = Object.values(thematicAnalysis)
      .sort((a, b) => b.projectCount - a.projectCount);

    console.log('\n📊 ICT THEMATIC OVERVIEW');
    console.log('=' .repeat(30));
    sortedThemes.forEach((analysis, index) => {
      console.log(`${index + 1}. ${analysis.theme}`);
      console.log(`   Projects: ${analysis.projectCount}`);
      console.log(`   Total Funding: €${analysis.totalFunding.toLocaleString()}`);
      console.log(`   Avg Funding: €${analysis.averageFunding.toLocaleString()}`);
      console.log('');
    });

    // Detailed analysis per theme
    sortedThemes.forEach(analysis => {
      console.log(`\n🎯 ${analysis.theme.toUpperCase()} ANALYSIS`);
      console.log('=' .repeat(50));
      
      console.log(`📈 Overview:`);
      console.log(`   Projects: ${analysis.projectCount}`);
      console.log(`   Total Funding: €${analysis.totalFunding.toLocaleString()}`);
      console.log(`   Average Funding: €${analysis.averageFunding.toLocaleString()}`);

      console.log(`\n💰 Top Funded Projects:`);
      analysis.topProjects.slice(0, 5).forEach((project, index) => {
        console.log(`   ${index + 1}. ${project.acronym}: €${project.fundingAmount.toLocaleString()}`);
        console.log(`      ${project.fullTitle}`);
      });

      console.log(`\n🏆 Top Collaborators:`);
      analysis.topCollaborators.slice(0, 10).forEach((collab, index) => {
        console.log(`   ${index + 1}. ${collab.name} (${collab.country})`);
        console.log(`      Collaboration Score: ${collab.collaborationScore}`);
        console.log(`      ICT Projects: ${collab.totalICTProjects}`);
        console.log(`      ICT Funding: €${collab.totalICTFunding.toLocaleString()}`);
        console.log(`      Leadership Roles: ${collab.leadershipRoles}`);
        console.log(`      Themes: ${collab.ictThemes.slice(0, 3).join(', ')}`);
        
        if (collab.topPartners.length > 0) {
          console.log(`      Top Partners: ${collab.topPartners.slice(0, 3).map(p => 
            `${p.name} (${p.projectCount})`).join(', ')}`);
        }
        console.log('');
      });

      // Show top collaboration pairs
      const topCollaborations = Object.entries(analysis.collaborationNetworks)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

      if (topCollaborations.length > 0) {
        console.log(`\n🤝 Top Collaboration Pairs:`);
        topCollaborations.forEach(([pair, count], index) => {
          const [org1, org2] = pair.split('|');
          const org1Name = analysis.topCollaborators.find(c => c.organizationId === org1)?.name || 'Unknown';
          const org2Name = analysis.topCollaborators.find(c => c.organizationId === org2)?.name || 'Unknown';
          console.log(`   ${index + 1}. ${org1Name} ↔ ${org2Name} (${count} projects)`);
        });
      }

      console.log('\n' + '-'.repeat(50));
    });

    // Save detailed results
    const results = {
      overview: {
        totalICTProjects: sortedThemes.reduce((sum, t) => sum + t.projectCount, 0),
        totalICTFunding: sortedThemes.reduce((sum, t) => sum + t.totalFunding, 0),
        themesAnalyzed: sortedThemes.map(t => t.theme)
      },
      thematicAnalysis: Object.fromEntries(
        Object.entries(thematicAnalysis).map(([theme, data]) => [
          theme,
          {
            ...data,
            topProjects: data.topProjects.slice(0, 10),
            topCollaborators: data.topCollaborators.slice(0, 15)
          }
        ])
      )
    };

    require('fs').writeFileSync('ict-analysis.json', JSON.stringify(results, null, 2));
    console.log('\n📁 Detailed ICT analysis saved to: ict-analysis.json');
  }
}

// Export the ICT analyzer
export {
  ICTAnalyzer,
  ICTProject,
  ICTCollaborator,
  ThematicAnalysis
};

// If running directly, execute the ICT analysis
if (require.main === module) {
  const analyzer = new ICTAnalyzer('./data');
  analyzer.generateICTReport(15);
}