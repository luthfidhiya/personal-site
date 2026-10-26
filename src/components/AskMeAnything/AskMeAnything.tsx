import { useState, type FormEvent } from "react";
import { SectionTitle } from "../ui/SectionTitle";
import { PixelButton } from "../ui/PixelButton";
import { PixelModal } from "../ui/PixelModal";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

const AskMeAnything = () => {
  const [question, setQuestion] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [ref, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) return;
    setShowConfirm(true);
  };

  const confirmSend = () => {
    alert("Question sent anonymously!");
    setQuestion("");
    setShowConfirm(false);
  };

  return (
    <section 
      id="ask-me-anything" 
      ref={ref}
      className={`bg-(--bg-card) py-24 px-8 max-md:px-4 min-h-[60vh] flex flex-col justify-center items-center w-full transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="w-full max-w-[800px] flex flex-col items-center gap-12">
        <SectionTitle subtitle="Got a question? Fire away!">Ask Me Anything</SectionTitle>
        
        <div className="w-full pixel-border bg-(--bg-primary)">
          <div className="bg-(--border-color) text-(--bg-primary) px-4 py-2 font-mono text-[0.8rem] text-left flex items-center justify-between">
            <span>ask_me_anything.sh</span>
            <div className="flex gap-2">
              <span className="w-3 h-3 bg-(--accent-pink) inline-block border border-(--border-color)"></span>
              <span className="w-3 h-3 bg-(--accent-yellow) inline-block border border-(--border-color)"></span>
              <span className="w-3 h-3 bg-(--accent-green) inline-block border border-(--border-color)"></span>
            </div>
          </div>
          
          <div className="bg-(--bg-card) p-8 max-md:p-4">
            <p className="font-mono text-(--text-secondary) mb-6 text-sm text-center md:text-left">
              Got a question about web development, design, or my workflow? 
              Drop an anonymous question below.
            </p>
            
            <form
              className="flex gap-4 items-center max-md:flex-col max-md:items-stretch"
              onSubmit={handleSubmit}
            >
              <span className="text-(--accent-pink) font-mono font-bold max-md:hidden text-xl">
                $
              </span>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 bg-transparent border-0 border-b-2 border-dashed border-(--text-secondary) font-mono text-base text-(--text-primary) p-2 outline-none focus:border-(--accent-cyan) transition-colors"
                required
              />
              <PixelButton
                variant="secondary"
                type="submit"
                className="px-6 py-2"
              >
                EXEC
              </PixelButton>
            </form>
          </div>
        </div>
      </div>

      <PixelModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="CONFIRM_EXEC.SH"
        onConfirm={confirmSend}
        confirmText="EXECUTE"
      >
        <div className="flex items-center gap-4 mb-4 text-(--text-primary)">
          <i className="hn hn-terminal text-3xl text-(--accent-pink)"></i>
          <p className="font-pixel text-xl">Send Question?</p>
        </div>
        <div className="bg-(--bg-primary) p-4 pixel-border-sm mt-4">
          <p className="font-mono text-sm text-(--text-primary) wrap-break-word">
            <span className="text-(--accent-green)">$ </span>{question}
          </p>
        </div>
        <p className="font-body text-(--text-secondary) text-sm mt-4 italic">
          This question will be sent anonymously.
        </p>
      </PixelModal>
    </section>
  );
};

export default AskMeAnything;
