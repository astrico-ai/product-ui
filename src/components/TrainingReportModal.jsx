import React from 'react';
import { X, ThumbsUp, ThumbsDown, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export function TrainingReportModal({ isOpen, onClose, scenario }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="modal-content max-h-[90vh] w-full max-w-6xl bg-white rounded-xl shadow-lg relative overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-4xl"
        >
          ×
        </button>

        <div className="p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Analysis <span className="text-gray-600">| Home Loan Switch Consultation</span></h2>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">Customer Service Simulation</h3>
              <p className="text-gray-600">Scenario: Helping a Customer Switch Their Home Loan Provider</p>
              <p className="text-gray-600">Task: Home Loan Consultation</p>
              <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="p-6 bg-blue-100 rounded-lg text-center">
              <h4 className="text-gray-700 font-medium">Performance Score</h4>
              <p className="text-2xl font-bold text-gray-800">80</p>
            </div>
          </div>

          {/* Warning Box */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700">
              Good understanding of customer needs and clear explanation of benefits. Areas for improvement include documentation requirements and process timeline details.
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
                      <span className="text-sm text-gray-500">4:30</span>
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
                  { name: 'Initial Assessment', score: 85, color: 'bg-blue-500', tip: 'Good job gathering current loan details and understanding customer needs.' },
                  { name: 'Product Knowledge', score: 70, color: 'bg-blue-500', tip: 'Could provide more specific details about interest rates and comparison rates.' },
                  { name: 'Cost Benefit Analysis', score: 90, color: 'bg-blue-500', tip: 'Excellent breakdown of potential savings and switching costs.' },
                  { name: 'Documentation Guide', score: 75, color: 'bg-blue-500', tip: 'Clear explanation of required documents, but missed mentioning income verification requirements.' },
                  { name: 'Next Steps Clarity', score: 80, color: 'bg-blue-500', tip: 'Well-structured explanation of the application process and timeline.' }
                ].map((category) => (
                  <div key={category.name}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-gray-700 font-medium">{category.name}</h4>
                      <span className="text-sm font-medium text-gray-600">{category.score}%</span>
                    </div>
                    <div className="h-2.5 mb-2 rounded-full bg-gray-200 overflow-hidden">
                      <div 
                        className={`h-full ${category.color} transition-all duration-500 ease-in-out`}
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
              <p className="text-gray-600 mb-4">A breakdown of how you handled the consultation</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Financial Empathy', passed: true, feedback: 'Showed understanding of customer\'s financial situation and concerns.' },
                  { name: 'Product Clarity', passed: true, feedback: 'Clear explanation of loan features and benefits.' },
                  { name: 'Risk Communication', passed: true, feedback: 'Well-explained potential risks and considerations.' },
                  { name: 'Process Guidance', passed: false, feedback: 'Could improve on explaining the step-by-step switching process.' }
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
      </div>
    </div>
  );
} 