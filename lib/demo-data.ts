import { System } from '@/types';

export const demoSystems: System[] = [
  {
    id: 'agent-training-pipeline',
    name: 'Agent Training Pipeline',
    description: 'Monitor training pipeline health for autonomous software agents',
    lastEvaluation: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    healthScore: 78,
    riskScore: 22,
    confidenceScore: 88,
    riskLevel: 'low',
    topRisks: ['task_completion_rate', 'reward_signal_drift'],
    signals: [
      {
        id: 'task_completion_rate',
        name: 'Task Completion Rate',
        category: 'business_impact',
        measurementType: 'rate',
        currentValue: 0.68,
        baselineValue: 0.72,
        thresholdRule: 'Alert if drops > 10%',
        confidence: 0.92,
        whyThisMatters: 'Completion rate drops indicate training degradation or environment issues',
        failureModeTags: ['training_regression', 'environment_instability'],
        severityWeight: 2.0,
        lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'reward_signal_drift',
        name: 'Reward Signal Distribution Drift',
        category: 'behavior_drift',
        measurementType: 'distribution_shift',
        currentValue: 0.18,
        baselineValue: 0.12,
        thresholdRule: 'Alert if > 0.15',
        confidence: 0.85,
        whyThisMatters: 'Reward drift suggests training instability or objective misalignment',
        failureModeTags: ['training_regression', 'objective_drift'],
        severityWeight: 1.9,
        lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'test_pass_rate',
        name: 'Test Pass Rate',
        category: 'pipeline_reliability',
        measurementType: 'rate',
        currentValue: 0.84,
        baselineValue: 0.88,
        thresholdRule: 'Alert if < 0.85',
        confidence: 0.95,
        whyThisMatters: 'Test failures indicate code quality degradation',
        failureModeTags: ['code_quality_degradation'],
        severityWeight: 1.8,
        lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'episode_length_trend',
        name: 'Episode Length Trend',
        category: 'behavior_drift',
        measurementType: 'distribution_shift',
        currentValue: 0.22,
        baselineValue: 0.15,
        thresholdRule: 'Alert if > 0.20',
        confidence: 0.78,
        whyThisMatters: 'Increasing episode length suggests agents are struggling or taking inefficient paths',
        failureModeTags: ['training_regression'],
        severityWeight: 1.6,
        lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'build_success_rate',
        name: 'Build Success Rate',
        category: 'pipeline_reliability',
        measurementType: 'rate',
        currentValue: 0.91,
        baselineValue: 0.94,
        thresholdRule: 'Alert if < 0.92',
        confidence: 0.9,
        whyThisMatters: 'Build failures block training progress',
        failureModeTags: ['infrastructure_issue'],
        severityWeight: 1.7,
        lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'code_review_feedback_velocity',
        name: 'Code Review Feedback Velocity',
        category: 'user_sentiment',
        measurementType: 'rate',
        currentValue: 0.045,
        baselineValue: 0.032,
        thresholdRule: 'Alert if > 0.04',
        confidence: 0.82,
        whyThisMatters: 'Increased feedback suggests quality issues requiring human intervention',
        failureModeTags: ['code_quality_degradation'],
        severityWeight: 1.5,
        lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'training_data_quality',
        name: 'Training Data Quality Score',
        category: 'data_quality',
        measurementType: 'ratio',
        currentValue: 0.78,
        baselineValue: 0.82,
        thresholdRule: 'Alert if drops > 5%',
        confidence: 0.88,
        whyThisMatters: 'Low quality training data degrades agent performance',
        failureModeTags: ['data_quality_issue'],
        severityWeight: 1.8,
        lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'environment_reset_frequency',
        name: 'Environment Reset Frequency',
        category: 'pipeline_reliability',
        measurementType: 'rate',
        currentValue: 0.12,
        baselineValue: 0.08,
        thresholdRule: 'Alert if > 0.10',
        confidence: 0.75,
        whyThisMatters: 'Frequent resets indicate environment instability or agent errors',
        failureModeTags: ['environment_instability'],
        severityWeight: 1.4,
        lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'convergence_rate',
        name: 'Learning Convergence Rate',
        category: 'behavior_drift',
        measurementType: 'rate',
        currentValue: 0.58,
        baselineValue: 0.65,
        thresholdRule: 'Alert if drops > 10%',
        confidence: 0.9,
        whyThisMatters: 'Slower convergence suggests training inefficiency',
        failureModeTags: ['training_regression'],
        severityWeight: 1.7,
        lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'action_space_coverage',
        name: 'Action Space Coverage',
        category: 'behavior_drift',
        measurementType: 'ratio',
        currentValue: 0.42,
        baselineValue: 0.48,
        thresholdRule: 'Alert if drops > 10%',
        confidence: 0.8,
        whyThisMatters: 'Reduced coverage suggests agents are stuck in local optima',
        failureModeTags: ['training_regression'],
        severityWeight: 1.6,
        lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ],
    failureModes: [
      {
        id: 'training_regression',
        name: 'Training Regression',
        severity: 5,
        detectability: 3,
        leadTime: '4 hours',
        primarySignalIds: ['task_completion_rate', 'reward_signal_drift', 'convergence_rate', 'episode_length_trend'],
        mitigationPlaybook: [
          'Review recent training configuration changes',
          'Check for data distribution shifts',
          'Analyze reward signal consistency',
          'Review hyperparameters',
          'Consider rolling back to previous checkpoint'
        ]
      },
      {
        id: 'environment_instability',
        name: 'Environment Instability',
        severity: 4,
        detectability: 4,
        leadTime: '2 hours',
        primarySignalIds: ['environment_reset_frequency', 'build_success_rate'],
        mitigationPlaybook: [
          'Check infrastructure health',
          'Review environment logs',
          'Verify resource availability',
          'Check for race conditions',
          'Restart unstable environments'
        ]
      },
      {
        id: 'code_quality_degradation',
        name: 'Code Quality Degradation',
        severity: 4,
        detectability: 4,
        leadTime: '3 hours',
        primarySignalIds: ['test_pass_rate', 'code_review_feedback_velocity'],
        mitigationPlaybook: [
          'Review failing test patterns',
          'Analyze code review feedback themes',
          'Check for systematic errors',
          'Review recent training data',
          'Adjust reward function if needed'
        ]
      },
      {
        id: 'data_quality_issue',
        name: 'Training Data Quality Issue',
        severity: 3,
        detectability: 3,
        leadTime: '6 hours',
        primarySignalIds: ['training_data_quality', 'task_completion_rate'],
        mitigationPlaybook: [
          'Audit training data sources',
          'Check data preprocessing pipeline',
          'Review data validation rules',
          'Verify label quality',
          'Regenerate corrupted datasets'
        ]
      },
      {
        id: 'objective_drift',
        name: 'Objective Function Drift',
        severity: 5,
        detectability: 2,
        leadTime: '8 hours',
        primarySignalIds: ['reward_signal_drift', 'task_completion_rate'],
        mitigationPlaybook: [
          'Review reward function implementation',
          'Check for reward hacking',
          'Analyze agent behavior patterns',
          'Verify objective alignment',
          'Re-calibrate reward signals'
        ]
      },
      {
        id: 'infrastructure_issue',
        name: 'Infrastructure Failure',
        severity: 3,
        detectability: 5,
        leadTime: '30 minutes',
        primarySignalIds: ['build_success_rate', 'environment_reset_frequency'],
        mitigationPlaybook: [
          'Check CI/CD pipeline status',
          'Review infrastructure logs',
          'Verify resource quotas',
          'Check for capacity issues',
          'Scale resources if needed'
        ]
      }
    ],
    incidents: [
      {
        id: 'inc-agent-1',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        symptom: 'Task completion rate dropped 15% over 2 days',
        rootCauseCategory: 'Data',
        impact: 'Training efficiency reduced by 20%, delayed milestone by 3 days',
        failureModeId: 'training_regression',
        whatWouldHaveCaughtThis: 'reward_signal_drift signal existed but threshold was too high (0.20). Should be 0.15.',
        signalsWereMissing: [],
        signalsWereTooWeak: ['reward_signal_drift']
      },
      {
        id: 'inc-agent-2',
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        symptom: 'Environment instability caused training interruptions',
        rootCauseCategory: 'Infrastructure',
        impact: 'Lost 8 hours of training time, had to restart multiple runs',
        failureModeId: 'environment_instability',
        whatWouldHaveCaughtThis: 'environment_reset_frequency signal was missing. Should monitor reset patterns.',
        signalsWereMissing: ['environment_reset_frequency'],
        signalsWereTooWeak: []
      },
      {
        id: 'inc-agent-3',
        date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        symptom: 'Test pass rate dropped due to systematic code quality issues',
        rootCauseCategory: 'Product',
        impact: 'Agent-generated code required significant manual fixes',
        failureModeId: 'code_quality_degradation',
        whatWouldHaveCaughtThis: 'code_review_feedback_velocity signal threshold was too high. Should alert at 0.035, not 0.04.',
        signalsWereMissing: [],
        signalsWereTooWeak: ['code_review_feedback_velocity']
      },
      {
        id: 'inc-agent-4',
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        symptom: 'Training data corruption caused performance degradation',
        rootCauseCategory: 'Data',
        impact: 'Agents learned incorrect patterns, required full retraining',
        failureModeId: 'data_quality_issue',
        whatWouldHaveCaughtThis: 'training_data_quality signal existed but only checked weekly. Should monitor continuously.',
        signalsWereMissing: [],
        signalsWereTooWeak: ['training_data_quality']
      }
    ],
    stressTests: [
      {
        id: 'stress-agent-1',
        name: 'Simulated Training Regression',
        description: 'Inject performance degradation pattern',
        expectedSignalsToFire: ['task_completion_rate', 'reward_signal_drift', 'convergence_rate'],
        passed: true,
        notes: 'All signals fired within 2 hours',
        lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'stress-agent-2',
        name: 'Environment Failure Injection',
        description: 'Simulate environment instability',
        expectedSignalsToFire: ['environment_reset_frequency', 'build_success_rate'],
        passed: true,
        notes: 'Signals caught the issue within 30 minutes',
        lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'stress-agent-3',
        name: 'Code Quality Degradation',
        description: 'Inject code quality issues',
        expectedSignalsToFire: ['test_pass_rate', 'code_review_feedback_velocity'],
        passed: false,
        notes: 'test_pass_rate fired but code_review_feedback_velocity did not catch it early enough',
        lastRun: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'stress-agent-4',
        name: 'Data Quality Corruption',
        description: 'Simulate training data issues',
        expectedSignalsToFire: ['training_data_quality', 'task_completion_rate'],
        passed: true,
        notes: 'Both signals detected the issue within 4 hours',
        lastRun: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'code-evaluation-system',
    name: 'Code Evaluation System',
    description: 'Monitor automated code quality and correctness evaluation',
    lastEvaluation: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    healthScore: 82,
    riskScore: 18,
    confidenceScore: 90,
    riskLevel: 'low',
    topRisks: ['evaluation_latency'],
    signals: [
      {
        id: 'evaluation_latency',
        name: 'Evaluation Latency',
        category: 'pipeline_reliability',
        measurementType: 'latency',
        currentValue: 3.2,
        baselineValue: 2.5,
        thresholdRule: 'Alert if > 3.0 seconds',
        confidence: 0.9,
        whyThisMatters: 'Slow evaluations block training progress',
        failureModeTags: ['evaluation_bottleneck'],
        severityWeight: 1.7,
        lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'evaluation_consistency',
        name: 'Evaluation Consistency Score',
        category: 'data_quality',
        measurementType: 'ratio',
        currentValue: 0.92,
        baselineValue: 0.95,
        thresholdRule: 'Alert if < 0.93',
        confidence: 0.88,
        whyThisMatters: 'Inconsistent evaluations create training noise',
        failureModeTags: ['evaluation_bottleneck'],
        severityWeight: 1.6,
        lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'test_coverage_rate',
        name: 'Test Coverage Rate',
        category: 'pipeline_reliability',
        measurementType: 'rate',
        currentValue: 0.78,
        baselineValue: 0.82,
        thresholdRule: 'Alert if drops > 5%',
        confidence: 0.85,
        whyThisMatters: 'Low coverage reduces evaluation reliability',
        failureModeTags: ['evaluation_bottleneck'],
        severityWeight: 1.5,
        lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'false_positive_rate',
        name: 'False Positive Rate',
        category: 'data_quality',
        measurementType: 'rate',
        currentValue: 0.028,
        baselineValue: 0.022,
        thresholdRule: 'Alert if > 0.025',
        confidence: 0.82,
        whyThisMatters: 'High false positives degrade training signal quality',
        failureModeTags: ['evaluation_bottleneck'],
        severityWeight: 1.8,
        lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'evaluation_queue_depth',
        name: 'Evaluation Queue Depth',
        category: 'pipeline_reliability',
        measurementType: 'count',
        currentValue: 45,
        baselineValue: 28,
        thresholdRule: 'Alert if > 40',
        confidence: 0.9,
        whyThisMatters: 'Queue buildup indicates capacity issues',
        failureModeTags: ['evaluation_bottleneck'],
        severityWeight: 1.6,
        lastUpdated: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        id: 'deterministic_test_rate',
        name: 'Deterministic Test Rate',
        category: 'pipeline_reliability',
        measurementType: 'rate',
        currentValue: 0.88,
        baselineValue: 0.92,
        thresholdRule: 'Alert if < 0.90',
        confidence: 0.95,
        whyThisMatters: 'Non-deterministic tests create unreliable training signals',
        failureModeTags: ['evaluation_bottleneck'],
        severityWeight: 2.0,
        lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'evaluation_timeout_rate',
        name: 'Evaluation Timeout Rate',
        category: 'pipeline_reliability',
        measurementType: 'rate',
        currentValue: 0.012,
        baselineValue: 0.008,
        thresholdRule: 'Alert if > 0.01',
        confidence: 0.88,
        whyThisMatters: 'Timeouts indicate performance or stability issues',
        failureModeTags: ['evaluation_bottleneck'],
        severityWeight: 1.7,
        lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'build_artifact_availability',
        name: 'Build Artifact Availability',
        category: 'pipeline_reliability',
        measurementType: 'rate',
        currentValue: 0.96,
        baselineValue: 0.98,
        thresholdRule: 'Alert if < 0.97',
        confidence: 0.92,
        whyThisMatters: 'Missing artifacts block evaluations',
        failureModeTags: ['evaluation_bottleneck'],
        severityWeight: 1.5,
        lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ],
    failureModes: [
      {
        id: 'evaluation_bottleneck',
        name: 'Evaluation Bottleneck',
        severity: 4,
        detectability: 4,
        leadTime: '1 hour',
        primarySignalIds: ['evaluation_latency', 'evaluation_queue_depth', 'evaluation_timeout_rate'],
        mitigationPlaybook: [
          'Scale evaluation infrastructure',
          'Optimize evaluation pipeline',
          'Review queue processing logic',
          'Check for resource constraints',
          'Parallelize evaluations if possible'
        ]
      }
    ],
    incidents: [
      {
        id: 'inc-eval-1',
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        symptom: 'Evaluation latency spike blocked training',
        rootCauseCategory: 'Infrastructure',
        impact: 'Training delayed by 6 hours, queue reached 200 items',
        failureModeId: 'evaluation_bottleneck',
        whatWouldHaveCaughtThis: 'evaluation_queue_depth signal was missing. Should monitor queue depth continuously.',
        signalsWereMissing: ['evaluation_queue_depth'],
        signalsWereTooWeak: []
      }
    ],
    stressTests: [
      {
        id: 'stress-eval-1',
        name: 'Evaluation Load Test',
        description: 'Simulate high evaluation load',
        expectedSignalsToFire: ['evaluation_latency', 'evaluation_queue_depth'],
        passed: true,
        notes: 'Both signals fired correctly',
        lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'agent-performance-tracking',
    name: 'Agent Performance Tracking',
    description: 'Track long-horizon agent journey performance and outcomes',
    lastEvaluation: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    healthScore: 71,
    riskScore: 29,
    confidenceScore: 85,
    riskLevel: 'medium',
    topRisks: ['journey_completion_rate', 'reward_consistency'],
    signals: [
      {
        id: 'journey_completion_rate',
        name: 'Journey Completion Rate',
        category: 'business_impact',
        measurementType: 'rate',
        currentValue: 0.58,
        baselineValue: 0.64,
        thresholdRule: 'Alert if drops > 8%',
        confidence: 0.93,
        whyThisMatters: 'Completion rate directly measures agent effectiveness',
        failureModeTags: ['performance_degradation'],
        severityWeight: 2.0,
        lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'reward_consistency',
        name: 'Reward Signal Consistency',
        category: 'data_quality',
        measurementType: 'ratio',
        currentValue: 0.82,
        baselineValue: 0.88,
        thresholdRule: 'Alert if < 0.85',
        confidence: 0.9,
        whyThisMatters: 'Inconsistent rewards create training instability',
        failureModeTags: ['performance_degradation'],
        severityWeight: 1.9,
        lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'long_horizon_success',
        name: 'Long-Horizon Task Success Rate',
        category: 'business_impact',
        measurementType: 'rate',
        currentValue: 0.52,
        baselineValue: 0.58,
        thresholdRule: 'Alert if drops > 10%',
        confidence: 0.88,
        whyThisMatters: 'Long-horizon tasks are the core value proposition',
        failureModeTags: ['performance_degradation'],
        severityWeight: 2.0,
        lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'step_efficiency',
        name: 'Step Efficiency Ratio',
        category: 'behavior_drift',
        measurementType: 'ratio',
        currentValue: 0.68,
        baselineValue: 0.72,
        thresholdRule: 'Alert if drops > 8%',
        confidence: 0.85,
        whyThisMatters: 'Low efficiency suggests agents are taking inefficient paths',
        failureModeTags: ['performance_degradation'],
        severityWeight: 1.7,
        lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'reward_hacking_detection',
        name: 'Reward Hacking Detection Score',
        category: 'behavior_drift',
        measurementType: 'ratio',
        currentValue: 0.12,
        baselineValue: 0.08,
        thresholdRule: 'Alert if > 0.10',
        confidence: 0.75,
        whyThisMatters: 'Reward hacking indicates objective misalignment',
        failureModeTags: ['objective_misalignment'],
        severityWeight: 1.8,
        lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'generalization_gap',
        name: 'Train-Test Generalization Gap',
        category: 'behavior_drift',
        measurementType: 'ratio',
        currentValue: 0.18,
        baselineValue: 0.14,
        thresholdRule: 'Alert if > 0.16',
        confidence: 0.88,
        whyThisMatters: 'Large gap suggests overfitting',
        failureModeTags: ['performance_degradation'],
        severityWeight: 1.6,
        lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'exploration_rate',
        name: 'Exploration Rate',
        category: 'behavior_drift',
        measurementType: 'rate',
        currentValue: 0.22,
        baselineValue: 0.28,
        thresholdRule: 'Alert if drops > 15%',
        confidence: 0.8,
        whyThisMatters: 'Low exploration suggests agents stuck in local optima',
        failureModeTags: ['performance_degradation'],
        severityWeight: 1.5,
        lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'verification_pass_rate',
        name: 'Verification Pass Rate',
        category: 'pipeline_reliability',
        measurementType: 'rate',
        currentValue: 0.85,
        baselineValue: 0.89,
        thresholdRule: 'Alert if < 0.87',
        confidence: 0.92,
        whyThisMatters: 'Verification failures indicate correctness issues',
        failureModeTags: ['performance_degradation'],
        severityWeight: 1.9,
        lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'deterministic_outcome_rate',
        name: 'Deterministic Outcome Rate',
        category: 'pipeline_reliability',
        measurementType: 'rate',
        currentValue: 0.94,
        baselineValue: 0.96,
        thresholdRule: 'Alert if < 0.95',
        confidence: 0.95,
        whyThisMatters: 'Non-deterministic outcomes reduce training signal quality',
        failureModeTags: ['performance_degradation'],
        severityWeight: 2.0,
        lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'agent_diversity_score',
        name: 'Agent Behavior Diversity Score',
        category: 'behavior_drift',
        measurementType: 'ratio',
        currentValue: 0.58,
        baselineValue: 0.64,
        thresholdRule: 'Alert if drops > 10%',
        confidence: 0.82,
        whyThisMatters: 'Low diversity suggests convergence to suboptimal strategies',
        failureModeTags: ['performance_degradation'],
        severityWeight: 1.6,
        lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      }
    ],
    failureModes: [
      {
        id: 'performance_degradation',
        name: 'Performance Degradation',
        severity: 5,
        detectability: 3,
        leadTime: '6 hours',
        primarySignalIds: ['journey_completion_rate', 'long_horizon_success', 'verification_pass_rate', 'step_efficiency'],
        mitigationPlaybook: [
          'Review recent model checkpoints',
          'Analyze performance trends',
          'Check for distribution shift',
          'Review reward function',
          'Consider curriculum adjustments'
        ]
      },
      {
        id: 'objective_misalignment',
        name: 'Objective Misalignment',
        severity: 5,
        detectability: 2,
        leadTime: '12 hours',
        primarySignalIds: ['reward_hacking_detection', 'reward_consistency'],
        mitigationPlaybook: [
          'Review reward function design',
          'Analyze agent behavior patterns',
          'Check for reward hacking',
          'Re-calibrate objectives',
          'Add reward shaping if needed'
        ]
      }
    ],
    incidents: [
      {
        id: 'inc-perf-1',
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        symptom: 'Journey completion rate dropped 12%',
        rootCauseCategory: 'Product',
        impact: 'Agent effectiveness reduced, required model retraining',
        failureModeId: 'performance_degradation',
        whatWouldHaveCaughtThis: 'step_efficiency signal existed but threshold was too high. Should alert at 5% drop, not 8%.',
        signalsWereMissing: [],
        signalsWereTooWeak: ['step_efficiency']
      },
      {
        id: 'inc-perf-2',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        symptom: 'Reward hacking detected in production agents',
        rootCauseCategory: 'Product',
        impact: 'Agents learned to game the reward system, produced incorrect outputs',
        failureModeId: 'objective_misalignment',
        whatWouldHaveCaughtThis: 'reward_hacking_detection signal was missing. Should monitor for reward exploitation patterns.',
        signalsWereMissing: ['reward_hacking_detection'],
        signalsWereTooWeak: []
      }
    ],
    stressTests: [
      {
        id: 'stress-perf-1',
        name: 'Performance Degradation Simulation',
        description: 'Simulate agent performance drop',
        expectedSignalsToFire: ['journey_completion_rate', 'long_horizon_success'],
        passed: true,
        notes: 'Signals detected the issue within 4 hours',
        lastRun: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'stress-perf-2',
        name: 'Reward Hacking Test',
        description: 'Inject reward hacking pattern',
        expectedSignalsToFire: ['reward_hacking_detection', 'reward_consistency'],
        passed: false,
        notes: 'reward_hacking_detection fired but reward_consistency did not catch it early',
        lastRun: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];
