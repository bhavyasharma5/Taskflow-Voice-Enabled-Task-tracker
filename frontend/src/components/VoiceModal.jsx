import { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useTaskStore from '../store/taskStore';

function VoiceModal({ onClose, onComplete }) {
  const { parseTranscript } = useTaskStore();
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [error, setError] = useState('');
  
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += text + ' ';
        } else {
          interimTranscript = text;
        }
      }

      const displayText = (finalTranscriptRef.current + interimTranscript).trim();
      setTranscript(displayText);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access and try again.');
      } else if (event.error !== 'no-speech') {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      if (isRecording) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      
      if (transcript.trim()) {
        handleParse();
      }
    } else {
      setTranscript('');
      setParsedData(null);
      setEditedData(null);
      setError('');
      finalTranscriptRef.current = '';
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleParse = async () => {
    if (!transcript.trim()) {
      toast.error('Please record some audio first');
      return;
    }

    setIsParsing(true);
    setError('');
    
    try {
      const result = await parseTranscript(transcript);
      setParsedData(result.parsed);
      setEditedData(result.parsed);
    } catch (err) {
      console.error('Parse error:', err);
      setError('Failed to parse transcript. Please try again.');
      toast.error('Failed to parse transcript');
    } finally {
      setIsParsing(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = () => {
    if (!editedData?.title?.trim()) {
      toast.error('Title is required');
      return;
    }
    onComplete(editedData);
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), "yyyy-MM-dd'T'HH:mm");
    } catch {
      return '';
    }
  };

  const priorityLabels = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' };
  const statusLabels = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal voice-modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2 className="modal-title">Create Task with Voice</h2>
            <button className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            <div className="voice-input-section">
              <button
                className={`voice-button ${isRecording ? 'recording' : ''}`}
                onClick={toggleRecording}
                disabled={!!error && !isRecording}
              >
                {isRecording ? <MicOff size={36} /> : <Mic size={36} />}
              </button>
              
              <p className="voice-instruction">
                {isRecording 
                  ? 'Listening... Click to stop'
                  : 'Click the microphone to start recording'}
              </p>
              
              <p className={`voice-status ${isRecording ? 'recording' : ''}`}>
                {isRecording 
                  ? '🔴 Recording...'
                  : transcript 
                    ? '✓ Recording complete'
                    : 'Ready to record'}
              </p>

              {error && (
                <p style={{ color: 'var(--accent-red)', fontSize: '13px', marginTop: '12px' }}>
                  {error}
                </p>
              )}
            </div>

            {transcript && (
              <div className="transcript-section">
                <p className="transcript-label">Transcript</p>
                <div className="transcript-text">"{transcript}"</div>

                {!parsedData && !isParsing && (
                  <button
                    className="btn btn-secondary"
                    style={{ marginTop: '16px', width: '100%' }}
                    onClick={handleParse}
                  >
                    <Sparkles size={16} />
                    Parse with AI
                  </button>
                )}

                {isParsing && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                    <span className="spinner"></span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      Parsing transcript...
                    </span>
                  </div>
                )}
              </div>
            )}

            {editedData && (
              <div className="parsed-preview">
                <div className="parsed-preview-header">
                  <h3 className="parsed-preview-title">Extracted Task Details</h3>
                  <span className="parsed-badge">AI Parsed</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editedData.title || ''}
                    onChange={(e) => handleEditChange('title', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input form-textarea"
                    value={editedData.description || ''}
                    onChange={(e) => handleEditChange('description', e.target.value)}
                    style={{ minHeight: '80px' }}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-input form-select"
                      value={editedData.priority || 'medium'}
                      onChange={(e) => handleEditChange('priority', e.target.value)}
                    >
                      {Object.entries(priorityLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-input form-select"
                      value={editedData.status || 'todo'}
                      onChange={(e) => handleEditChange('status', e.target.value)}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={formatDueDate(editedData.dueDate)}
                    onChange={(e) => handleEditChange('dueDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            {editedData && (
              <button className="btn btn-primary" onClick={handleCreate}>
                Create Task
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default VoiceModal;
