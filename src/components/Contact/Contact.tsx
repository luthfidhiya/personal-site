import { useState, useRef, type FormEvent } from "react";
import { SectionTitle } from "../ui/SectionTitle";
import { PixelButton } from "../ui/PixelButton";
import { PixelModal } from "../ui/PixelModal";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

const Contact = () => {
  const [titleRef, titleVisible] = useScrollAnimation();
  const [formRef, formVisible] = useScrollAnimation();
  const [socialRef, socialVisible] = useScrollAnimation();
  
  const [showConfirm, setShowConfirm] = useState(false);
  const formElementRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const confirmSend = () => {
    alert("Message Sent!");
    if (formElementRef.current) formElementRef.current.reset();
    setShowConfirm(false);
  };

  return (
    <section
      id="contact"
      className="bg-(--bg-card) py-24 min-h-screen flex flex-col justify-center items-center w-full"
    >
      <div className="w-full max-w-[1200px] mx-auto px-8 max-md:px-6 relative flex flex-col items-center">
        <div
          ref={titleRef}
          className={`reveal reveal-up ${titleVisible ? "visible" : ""} w-full`}
        >
          <SectionTitle subtitle="Let's connect and build something great">Contact</SectionTitle>
        </div>

        <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* Left Column: Socials */}
          <div
            ref={socialRef}
            className={`reveal reveal-left delay-200 bg-(--bg-card) p-8 pixel-border w-full flex flex-col h-fit ${
              socialVisible ? "visible" : ""
            }`}
          >
            <div className="bg-(--border-color) px-4 py-2 flex items-center justify-between mb-8 -mx-8 -mt-8 border-b-4 border-(--border-color)">
              <span className="font-mono text-xs text-(--bg-primary)">
                SOCIALS.LST
              </span>
              <div className="flex gap-2">
                <span className="w-3 h-3 bg-(--accent-pink) inline-block border border-(--border-color)"></span>
                <span className="w-3 h-3 bg-(--accent-yellow) inline-block border border-(--border-color)"></span>
                <span className="w-3 h-3 bg-(--accent-green) inline-block border border-(--border-color)"></span>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <a
                href="mailto:hello@example.com"
                className="flex items-center gap-4 group no-underline"
              >
                <i className="hn hn-message-dots-solid text-3xl group-hover:scale-110 transition-transform drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"></i>
                <span className="font-mono transition-colors text-lg">
                  hello@example.com
                </span>
              </a>
              <a
                href="#"
                className="flex items-center gap-4 group no-underline"
              >
                <i className="hn hn-linkedin text-3xl group-hover:scale-110 transition-transform drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"></i>
                <span className="font-mono transition-colors text-lg">
                  LinkedIn
                </span>
              </a>
              <a
                href="#"
                className="flex items-center gap-4 group no-underline"
              >
                <i className="hn hn-github text-3xl group-hover:scale-110 transition-transform drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"></i>
                <span className="font-mono transition-colors text-lg">
                  GitHub
                </span>
              </a>
              <div className="flex items-center gap-4">
                <i className="hn hn-location-pin-solid text-3xl drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"></i>
                <span className="font-mono text-lg">Yogyakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div
            ref={formRef}
            className={`reveal reveal-right delay-300 bg-(--bg-card-alt) p-8 pixel-border w-full flex flex-col ${
              formVisible ? "visible" : ""
            }`}
          >
            <div className="bg-(--border-color) px-4 py-2 flex items-center justify-between mb-8 -mx-8 -mt-8 border-b-4 border-(--border-color)">
              <span className="font-mono text-xs text-(--bg-primary)">
                SEND_MSG.EXE
              </span>
              <div className="flex gap-2">
                <span className="w-3 h-3 bg-(--accent-pink) inline-block border border-(--border-color)"></span>
                <span className="w-3 h-3 bg-(--accent-yellow) inline-block border border-(--border-color)"></span>
                <span className="w-3 h-3 bg-(--accent-green) inline-block border border-(--border-color)"></span>
              </div>
            </div>

            <form
              ref={formElementRef}
              className="flex flex-col gap-6 h-full"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="font-pixel text-xs text-(--text-primary)"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="pixel-input"
                  placeholder="Player Name"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="font-pixel text-xs text-(--text-primary)"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="pixel-input"
                  placeholder="player_email@email.com"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 grow">
                <label
                  htmlFor="message"
                  className="font-pixel text-xs text-(--text-primary)"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  className="pixel-input resize-none h-full min-h-[120px]"
                  placeholder="Enter your message here..."
                  required
                ></textarea>
              </div>

              <PixelButton
                variant="primary"
                type="submit"
                className="mt-4 p-4 text-base w-full group"
              >
                <span className="group-hover:animate-ping mr-2">▶</span> SEND
                MESSAGE
              </PixelButton>
            </form>
          </div>
        </div>
      </div>

      <PixelModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="CONFIRM_SEND.EXE"
        onConfirm={confirmSend}
        confirmText="SEND IT"
      >
        <div className="flex items-center gap-4 mb-4 text-(--text-primary)">
          <i className="hn hn-mail-solid text-3xl text-(--accent-cyan)"></i>
          <p className="font-pixel text-xl">Are you sure?</p>
        </div>
        <p className="font-body text-(--text-secondary) mt-4">
          You are about to send a message to Luthfi Dhiya. 
          I will try to get back to you as soon as possible.
        </p>
      </PixelModal>
    </section>
  );
};

export default Contact;
