'use client';

import { ArrowDownRight, ArrowUpRight, Mail, Send } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { sendEmail } from '@/app/actions';
import { SocialLinks } from '@/components/SocialLinks';

const emptyForm = { name: '', company: '', email: '', message: '' };
const fieldClassName =
  'w-full rounded-xl border border-line bg-canvas px-4 py-3 text-base text-paper placeholder:text-muted focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60';

type FormStatus = {
  type: 'idle' | 'sending' | 'success' | 'error';
  message: string;
};

export function Contact() {
  const submissionInFlight = useRef(false);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<FormStatus>({ type: 'idle', message: '' });
  const isPending = status.type === 'sending';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionInFlight.current) return;

    const data = {
      name: form.name.trim(),
      company: form.company.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    };

    if (!data.name || data.message.length < 10) {
      setStatus({
        type: 'error',
        message: 'Please add your name and a message of at least 10 characters, not just spaces.',
      });
      return;
    }

    // Lock immediately, before React renders the disabled controls.
    submissionInFlight.current = true;
    setStatus({ type: 'sending', message: 'Sending your message…' });

    try {
      const result = await sendEmail(data);

      if (result.success) {
        setForm(emptyForm);
        setStatus({ type: 'success', message: 'Thanks for reaching out. Your message has been sent.' });
      } else {
        setStatus({
          type: 'error',
          message: `${result.error || 'Your message could not be sent.'} Your draft is still here. You can try again or email me directly.`,
        });
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'I couldn’t confirm that your message was sent. Your draft is still here; please try again or email me directly.',
      });
    } finally {
      submissionInFlight.current = false;
    }
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="section-spacing border-t border-line bg-surface/50 text-paper"
    >
      <div className="section-shell">
        <p className="eyebrow mb-6"><span className="text-accent">06</span> / Correspondence</p>
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div className="min-w-0">
            <div data-parallax aria-hidden="true" className="contact-orbit mb-8"><ArrowDownRight size={32} strokeWidth={1.25} /></div>
            <h2 id="contact-title" data-reveal className="section-title max-w-xl">
              Contact
            </h2>
            <p className="body-copy mt-6 max-w-lg">
              For software projects through Talosys, engineering roles, or a technical conversation.
            </p>
            <p className="body-copy mt-4 max-w-lg">
              A short description of the problem is enough to start. If there’s an existing system,
              include the stack, what needs to change, and any timing constraints.
            </p>

            <div className="mt-8 border-t border-line pt-6">
              <p className="mb-2 text-sm text-muted">Prefer email? Write to me directly.</p>
              <a
                href="mailto:syokslawrence@gmail.com"
                className="inline-flex min-h-11 max-w-full items-center gap-3 rounded-sm text-base text-paper underline decoration-line underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:text-lg"
              >
                <Mail aria-hidden="true" className="h-5 w-5 shrink-0 text-accent" />
                <span className="min-w-0 break-all">syokslawrence@gmail.com</span>
                <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
              </a>
              <div className="mt-5">
                <SocialLinks label="Larry’s social and contact links" />
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            aria-labelledby="contact-form-title"
            aria-describedby="contact-form-note"
            className="min-w-0 rounded-3xl border border-line bg-canvas p-5 shadow-[0_16px_60px_-40px_rgba(32,35,43,0.25)] sm:p-8"
          >
            <h3 id="contact-form-title" className="text-xl font-semibold tracking-tight">Send me a note</h3>
            <p id="contact-form-note" className="mt-2 text-sm leading-relaxed text-muted">
              All fields are required except company or team.
            </p>

            <fieldset disabled={isPending} aria-busy={isPending} className="mt-6 min-w-0 space-y-5">
              <legend className="sr-only">Your contact details and message</legend>
              <div>
                <label htmlFor="contact-name" className="mb-2 block text-sm font-medium">Your name</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-2 block text-sm font-medium">Email address</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="contact-company" className="mb-2 block text-sm font-medium">
                  Company or team <span className="font-normal text-muted">(optional)</span>
                </label>
                <input
                  id="contact-company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  maxLength={200}
                  value={form.company}
                  onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-2 block text-sm font-medium">What’s on your mind?</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  required
                  minLength={10}
                  maxLength={5000}
                  aria-describedby="contact-message-hint"
                  placeholder="What are you working on? What do you need help with?"
                  value={form.message}
                  onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                  className={`${fieldClassName} min-h-40 resize-y`}
                />
                <p id="contact-message-hint" className="mt-2 text-xs leading-relaxed text-muted">
                  10–5,000 characters. A little context is a good place to start.
                </p>
              </div>
            </fieldset>

            <p
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className={`mt-4 min-h-6 text-sm leading-relaxed ${status.type === 'error' ? 'text-ochre' : status.type === 'success' ? 'text-accent' : 'text-muted'}`}
            >
              {status.message}
            </p>
            <button
              type="submit"
              disabled={isPending}
              className="button-primary mt-4 w-full justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send aria-hidden="true" className="h-4 w-4" />
              {isPending ? 'Sending…' : 'Send message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
