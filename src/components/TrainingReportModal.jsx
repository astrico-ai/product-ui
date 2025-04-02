import React from 'react';
import { X, ThumbsUp, ThumbsDown, Clock, AlertTriangle } from 'lucide-react';
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
            <h2 className="text-xl font-semibold">Analysis <span className="text-gray-600">| {scenario?.title}</span></h2>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">Conversation Simulation</h3>
              <p className="text-gray-600">Course: {scenario?.title}</p>
              <p className="text-gray-600">Task: {scenario?.task || 'Training Simulation'}</p>
              <p className="text-gray-600">{scenario?.completedDate}</p>
            </div>
            <div className="p-6 bg-green-200 rounded-lg text-center">
              <h4 className="text-gray-700 font-medium">AI Score</h4>
              <p className="text-2xl font-bold text-gray-800">{scenario?.score}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="col-span-2 p-4 bg-white shadow rounded-lg">
              <h3 className="text-lg font-bold">AI Trainer Feedback</h3>
              <p className="text-gray-700 mt-2">Overall, you performed well in the training simulation, demonstrating strong engagement and clear communication.</p>
              <ul className="list-disc pl-6 mt-2 text-gray-600">
                <li>You did a good job introducing yourself and the company, capturing attention effectively.</li>
                <li>You proposed clear next steps and respected the customer's time.</li>
                <li>You could improve by stating the purpose of your interaction more clearly.</li>
                <li>You could make the call-to-action more compelling by offering specific benefits.</li>
              </ul>
              <div className="mt-4">
                <h3 className="text-lg font-bold">Training Video</h3>
                <iframe 
                  className="w-full mt-2 rounded-lg shadow" 
                  height="315" 
                  src="https://drive.google.com/file/d/1YbLMB-q8jhMJGB6-HrZrYNIM65HPwe4b/preview" 
                  allow="autoplay" 
                  allowFullScreen
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="p-4 bg-white shadow rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="text-gray-700 font-bold">Knowledge</h4>
                  <span className="px-2 py-1 bg-green-200 text-gray-800 font-bold rounded-lg">87</span>
                </div>
                <p className="text-sm text-gray-600">70% of total score</p>
                <div className="mt-4">
                  <h4 className="text-gray-700 font-medium text-[14px]">Proficiency</h4>
                  <p className="text-[13px] text-gray-600">How well you know your stuff</p>
                  <Progress value={80} className="h-2.5 mt-2" />
                </div>
              </div>

              <div className="p-4 bg-white shadow rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="text-gray-700 font-bold">Style</h4>
                  <span className="px-2 py-1 bg-green-200 text-gray-800 font-bold rounded-lg">100</span>
                </div>
                <p className="text-sm text-gray-600">30% of total score</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="text-gray-700 font-medium text-[14px]">Clarity</h4>
                    <p className="text-[13px] text-gray-600">How comprehensible your speech is</p>
                    <Progress value={100} className="h-2.5 mt-2" />
                  </div>
                  <div>
                    <h4 className="text-gray-700 font-medium text-[14px]">Pace</h4>
                    <p className="text-[13px] text-gray-600">How optimal your speaking tempo is</p>
                    <Progress value={90} className="h-2.5 mt-2" />
                  </div>
                  <div>
                    <h4 className="text-gray-700 font-medium text-[14px]">Filler Words</h4>
                    <p className="text-[13px] text-gray-600">Did you say um-s, you know-s, like-s etc.</p>
                    <Progress value={85} className="h-2.5 mt-2" />
                  </div>
                  <div>
                    <h4 className="text-gray-700 font-medium text-[14px]">Sentence Length</h4>
                    <p className="text-[13px] text-gray-600">How straightforward your sentences are</p>
                    <Progress value={95} className="h-2.5 mt-2" />
                  </div>
                  <div>
                    <h4 className="text-gray-700 font-medium text-[14px]">Energy</h4>
                    <p className="text-[13px] text-gray-600">How confident you sound</p>
                    <Progress value={98} className="h-2.5 mt-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Knowledge Breakdown Section */}
          <div className="mt-6 p-6 bg-gray-50 rounded-lg shadow-lg relative">
            <div className="absolute top-4 right-4 bg-green-200 px-3 py-1 rounded-lg">
              <p className="text-xl font-bold text-gray-800 text-center">87</p>
            </div>
            <h3 className="text-xl font-bold text-black">Knowledge</h3>
            <p className="text-gray-700">A breakdown of <strong>what</strong> you covered or didn't cover </p>

            {/* Introduction Section */}
            <div className="mt-4 p-4 bg-white shadow rounded-lg relative">
              <h4 className="text-md font-bold">Introduction</h4>
              <div className="absolute top-4 right-4 bg-green-200 px-3 py-1 rounded-lg">
                <p className="text-xl font-bold text-gray-800 text-center">80</p>
              </div>
              <div className="mt-2">
                <h5 className="font-medium text-black">What did you do well?</h5>
                <ul className="list-disc pl-6 text-gray-600">
                  <li className="flex items-center">
                    <ThumbsUp className="w-4 h-4 text-green-600 mr-2" />
                    Introduced yourself and the company clearly.
                  </li>
                  <li className="flex items-center">
                    <ThumbsUp className="w-4 h-4 text-green-600 mr-2" />
                    Engaged Linda by asking about her internet issues.
                  </li>
                </ul>
              </div>
              <div className="mt-2">
                <h5 className="font-medium text-black">What needs improvement?</h5>
                <ul className="list-disc pl-6 text-gray-600">
                  <li className="flex items-center">
                    <ThumbsDown className="w-4 h-4 text-red-600 mr-2" />
                    State the purpose of your call more clearly.
                  </li>
                  <li className="flex items-center">
                    <ThumbsDown className="w-4 h-4 text-red-600 mr-2" />
                    Mention company credentials or achievements for credibility.
                  </li>
                </ul>
              </div>
            </div>

            {/* Solution Explanation Section */}
            <div className="mt-4 p-4 bg-white shadow rounded-lg relative">
              <h4 className="text-md font-bold">Solution Explanation</h4>
              <div className="absolute top-4 right-4 bg-green-200 px-3 py-1 rounded-lg">
                <p className="text-xl font-bold text-gray-800 text-center">80</p>
              </div>
              <div className="mt-2">
                <h5 className="font-medium text-black">What did you do well?</h5>
                <ul className="list-disc pl-6 text-gray-600">
                  <li className="flex items-center">
                    <ThumbsUp className="w-4 h-4 text-green-600 mr-2" />
                    Highlighted benefits of the new internet service well.
                  </li>
                  <li className="flex items-center">
                    <ThumbsUp className="w-4 h-4 text-green-600 mr-2" />
                    Addressed Linda's concerns about transferring the service.
                  </li>
                </ul>
              </div>
              <div className="mt-2">
                <h5 className="font-medium text-black">What needs improvement?</h5>
                <ul className="list-disc pl-6 text-gray-600">
                  <li className="flex items-center">
                    <ThumbsDown className="w-4 h-4 text-red-600 mr-2" />
                    Emphasize support for high-bandwidth activities more explicitly.
                  </li>
                  <li className="flex items-center">
                    <ThumbsDown className="w-4 h-4 text-red-600 mr-2" />
                    Mention the company's commitment to sustainability and cost-effectiveness.
                  </li>
                </ul>
              </div>
            </div>

            {/* Call-to-Action Section */}
            <div className="mt-4 p-4 bg-white shadow rounded-lg relative">
              <h4 className="text-md font-bold">Call-to-Action</h4>
              <div className="absolute top-4 right-4 bg-green-200 px-3 py-1 rounded-lg">
                <p className="text-xl font-bold text-gray-800 text-center">80</p>
              </div>
              <div className="mt-2">
                <h5 className="font-medium text-black">What did you do well?</h5>
                <ul className="list-disc pl-6 text-gray-600">
                  <li className="flex items-center">
                    <ThumbsUp className="w-4 h-4 text-green-600 mr-2" />
                    Proposed a clear next step by mentioning that someone will call Linda.
                  </li>
                  <li className="flex items-center">
                    <ThumbsUp className="w-4 h-4 text-green-600 mr-2" />
                    Approach respects Linda's busy schedule.
                  </li>
                </ul>
              </div>
              <div className="mt-2">
                <h5 className="font-medium text-black">What needs improvement?</h5>
                <ul className="list-disc pl-6 text-gray-600">
                  <li className="flex items-center">
                    <ThumbsDown className="w-4 h-4 text-red-600 mr-2" />
                    Make the call-to-action more compelling by offering a trial period.
                  </li>
                  <li className="flex items-center">
                    <ThumbsDown className="w-4 h-4 text-red-600 mr-2" />
                    Provide more detailed information about the benefits and costs.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Style Breakdown Section */}
          <div className="mt-6 p-6 bg-gray-50 rounded-lg shadow-lg relative">
            <div className="absolute top-4 right-4 bg-green-200 px-3 py-1 rounded-lg">
              <p className="text-xl font-bold text-gray-800 text-center">100</p>
            </div>
            <h3 className="text-lg font-bold">Style</h3>
            <p className="text-gray-700">A breakdown of <strong>how</strong> you handled the conversation </p>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* Pace Section */}
              <div className="p-4 bg-white shadow rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-semibold">Pace</h4>
                  <span className="px-2 py-1 bg-green-200 text-gray-800 font-bold rounded-lg">174 WPM</span>
                </div>
                <p className="text-gray-600">Keep your sentences 7-30 words long to make your point faster and more accurate.</p>
                <div className="mt-2">
                  <p className="text-green-700 flex items-center">✅ Your average pace was good. Keep it up.</p>
                  <p className="text-yellow-600 flex items-center">⚠️ Review when you spoke the fastest (at 278 WPM) - <a href="#" className="text-blue-600 underline">02:59</a></p>
                </div>
                <div className="w-full mt-2">
                  <div className="relative w-full flex">
                    <div className="w-1/6 bg-orange-500 h-2.5 rounded-l-full"></div>
                    <div className="w-2/4 bg-green-500 h-2.5"></div>
                    <div className="w-1/6 bg-orange-500 h-2.5"></div>
                    <div className="w-1/6 bg-red-500 h-2.5 rounded-r-full"></div>
                    <div className="absolute left-1/3 transform -translate-x-1/2 -top-3 text-black text-xs font-semibold">▼</div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>&lt; 6</span>
                    <span>7 - 30</span>
                    <span>31 - 42</span>
                    <span>&gt; 43</span>
                  </div>
                </div>
              </div>

              {/* Clarity Section */}
              <div className="p-4 bg-white shadow rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-semibold">Clarity</h4>
                  <span className="px-2 py-1 bg-green-200 text-gray-800 font-bold rounded-lg">97% Clarity</span>
                </div>
                <p className="text-gray-600">Speak clearly to ensure your message is effectively communicated.</p>
                <div className="mt-2">
                  <p className="text-green-700 flex items-center">✅ Your clarity is good, meaning people can understand you well. Keep up the good work!</p>
                </div>
              </div>

              {/* Sentence Length Section */}
              <div className="p-4 bg-white shadow rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-semibold">Sentence Length</h4>
                  <span className="px-2 py-1 bg-green-200 text-gray-800 font-bold rounded-lg">14 Words</span>
                </div>
                <p className="text-gray-600">Keep your sentences 7-30 words long to make your point faster and more accurate.</p>
                <div className="mt-2">
                  <p className="text-green-700 flex items-center">✅ Your average sentence length is good.</p>
                </div>
              </div>

              {/* Filler Words Section */}
              <div className="p-4 bg-white shadow rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-semibold">Filler Words</h4>
                  <span className="px-2 py-1 bg-green-200 text-gray-800 font-bold rounded-lg">4 Words</span>
                </div>
                <p className="text-gray-600">Using filler words diminishes your credibility and distracts from your message.</p>
                <div className="mt-2">
                  <p className="text-green-700 flex items-center">✅ Good job! You are not using too many filler words.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 