import React from 'react';
import { X, ThumbsUp, ThumbsDown, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export function MiningTrainingReportModal({ isOpen, onClose, scenario }) {
  if (!isOpen) return null;

  // Check if this is a safety scenario
  const isSafetyScenario = scenario?.title?.includes('Heat Stress');

  const renderSafetyReport = () => (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Analysis <span className="text-gray-600">| Heat Stress Response Drill</span></h2>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">Safety Simulation</h3>
          <p className="text-gray-600">Scenario: Heat Stress During Kiln Maintenance</p>
          <p className="text-gray-600">Task: Peer-Level Safety Response</p>
          <p className="text-gray-600">Date: 06-06-2025</p>
        </div>
        <div className="p-6 bg-red-100 rounded-lg text-center">
          <h4 className="text-gray-700 font-medium">Performance Score</h4>
          <p className="text-2xl font-bold text-gray-800">72</p>
        </div>
      </div>

      {/* Warning Box */}
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">
          Needs improvement in action timing and escalation flow. Good awareness and intention shown, but clarity and sequencing need to be strengthened.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        {/* Audio Recording */}
        <div className="p-4 bg-white shadow rounded-lg">
          <h3 className="text-lg font-bold mb-4">🎙️ Conversation Recording</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full bg-primary text-white hover:bg-primary/90">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </button>
              <div className="flex-1">
                <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                  {/* Fake waveform visualization */}
                  <div className="absolute inset-0 flex items-center justify-between px-2">
                    {[...Array(50)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-primary/60"
                        style={{
                          height: `${Math.sin(i * 0.5) * 20 + 30}%`,
                          opacity: i % 2 === 0 ? 0.7 : 1
                        }}
                      ></div>
                    ))}
                  </div>
                  {/* Playback progress overlay */}
                  <div className="absolute inset-y-0 left-0 bg-black/10 w-0"></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-500">0:00</span>
                  <span className="text-sm text-gray-500">3:45</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Trainer Feedback */}
        <div className="p-4 bg-white shadow rounded-lg">
          <h3 className="text-lg font-bold mb-4">📋 AI Trainer Feedback</h3>
          <div className="space-y-4">
            {[
              { 
                name: 'Recognizing Symptoms', 
                status: 'Yes',
                statusColor: 'bg-green-100 text-green-700 border-green-200',
                tip: 'You identified signs of heat stress, but it took prompting to act quickly.'
              },
              { 
                name: 'Immediate Peer Action',
                status: 'Partially',
                statusColor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                tip: 'You showed willingness to check in, but delayed action slightly.'
              },
              { 
                name: 'Escalation Handling',
                status: 'Partially',
                statusColor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                tip: 'You attempted to convince the supervisor instead of escalating immediately.'
              },
              { 
                name: 'Monitoring Awareness',
                status: 'Partially',
                statusColor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                tip: 'You offered to stay with Rahul, but missed the chance to delegate responsibly.'
              },
              { 
                name: 'Incident Reporting',
                status: 'No',
                statusColor: 'bg-red-100 text-red-700 border-red-200',
                tip: 'You needed prompting to report the near-miss. Reporting is critical in these situations.'
              }
            ].map((category) => (
              <div key={category.name}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-gray-700 font-medium">{category.name}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${category.statusColor}`}>
                    {category.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{category.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Soft Skills */}
        <div className="p-4 bg-white shadow rounded-lg">
          <h3 className="text-lg font-bold mb-4">💬 Soft Skills</h3>
          <p className="text-gray-600 mb-4">A breakdown of how you handled the situation</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Empathy', passed: true, feedback: 'You showed care for Rahul\'s condition and intended to help.' },
              { name: 'Clarity', passed: false, feedback: 'Your responses were hesitant at times and could be more structured.' },
              { name: 'Confidence', passed: true, feedback: 'You stood your ground with the supervisor and tried to advocate.' },
              { name: 'Situational Judgment', passed: false, feedback: 'You delayed escalation and skipped the reporting step without guidance.' }
            ].map((skill) => (
              <div key={skill.name} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {skill.passed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <h4 className="font-medium">{skill.name}</h4>
                </div>
                <p className="text-sm text-gray-600">{skill.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNegotiationReport = () => (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Analysis <span className="text-gray-600">| Strategic Negotiation Drill</span></h2>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">Sales Negotiation Simulation</h3>
          <p className="text-gray-600">Scenario: {scenario?.title}</p>
          <p className="text-gray-600">Task: {scenario?.task || 'B2B Sales Training'}</p>
          <p className="text-gray-600">Date: {scenario?.completedDate}</p>
        </div>
        <div className="p-6 bg-yellow-100 rounded-lg text-center">
          <h4 className="text-gray-700 font-medium">Performance Score</h4>
          <p className="text-2xl font-bold text-gray-800">{scenario?.score || '65'}</p>
        </div>
      </div>

      {/* Warning Box */}
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">
          Need to improve on Opening Position and Negotiation Skills. Good handling of objections, but pricing strategy needs refinement.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        {/* AI Trainer Feedback */}
        <div className="p-4 bg-white shadow rounded-lg">
          <h3 className="text-lg font-bold mb-4">📋 AI Trainer Feedback</h3>
          <div className="space-y-4">
            {[
              { name: 'Opening Position', score: 65, tip: 'You could have highlighted the impact on maintenance schedule and production costs.' },
              { name: 'Trading Variables', score: 75, tip: 'You traded variables well except for the credit period, where you readily agreed without negotiating.' },
              { name: 'Objection Handling', score: 90, tip: 'You did an excellent job of handling objections and making your case.' },
              { name: 'Negotiation Outcomes', score: 50, tip: 'You could have extracted better price & credit terms, especially that the major concerns of the customer were addressed.' },
              { name: 'Value Proposition', score: 70, tip: 'Good presentation of benefits, but could be more specific about ROI and long-term savings.' }
            ].map((category) => (
              <div key={category.name}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-gray-700 font-medium">{category.name}</h4>
                </div>
                <div className="h-2.5 mb-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${category.color}`}
                    style={{ width: `${category.score}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{category.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Soft Skills */}
        <div className="p-4 bg-white shadow rounded-lg">
          <h3 className="text-lg font-bold mb-4">💬 Soft Skills</h3>
          <p className="text-gray-600 mb-4">A breakdown of how you handled the negotiation</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Rapport Building', passed: false, feedback: 'You need to establish better initial connection with the customer.' },
              { name: 'Clarity', passed: false, feedback: 'Your value proposition could be more structured and clear.' },
              { name: 'Empathy', passed: true, feedback: 'You demonstrated understanding of customer\'s business needs and concerns.' },
              { name: 'Confidence', passed: true, feedback: 'You maintained professional composure throughout the negotiation.' }
            ].map((skill) => (
              <div key={skill.name} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {skill.passed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <h4 className="font-medium">{skill.name}</h4>
                </div>
                <p className="text-sm text-gray-600">{skill.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="modal-content max-h-[90vh] w-full max-w-6xl bg-white rounded-xl shadow-lg relative overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-4xl"
        >
          ×
        </button>

        {isSafetyScenario ? renderSafetyReport() : renderNegotiationReport()}
      </div>
    </div>
  );
} 