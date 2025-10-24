import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsOfServiceDialogProps {
  trigger: React.ReactNode;
}

export default function TermsOfServiceDialog({ trigger }: TermsOfServiceDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]" data-testid="dialog-terms-of-service">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl text-gray-900">
            Terms of Service
          </DialogTitle>
          <DialogDescription>
            Effective Date: October 2025 | Last Updated: October 2025
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm text-gray-700" data-testid="content-terms-of-service">
            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">1. Introduction</h3>
              <p>
                Welcome to The Dram Journal ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of our progressive web app (the "App"). By creating an account or using the App, you agree to be bound by these Terms. If you do not agree, please do not use the App.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">2. Eligibility</h3>
              <p>
                You must be at least 18 years of age to use this App. By using the App, you confirm that you meet this requirement and have the legal capacity to enter into a binding agreement.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">3. Account Registration</h3>
              <p>
                To access certain features of the App, you must create an account and provide accurate information, including your first name, last name, email address, username, and password. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">4. User Responsibilities</h3>
              <p className="mb-2">By using the App, you agree that you will not:</p>
              <ul className="list-disc ml-6">
                <li>Use the App for unlawful or fraudulent purposes</li>
                <li>Upload or share content that is offensive, defamatory, or violates the rights of others</li>
                <li>Attempt to interfere with the App's operation or security</li>
                <li>Reverse engineer, copy, or redistribute any part of the App without authorization</li>
                <li>Impersonate another user or misrepresent your identity</li>
              </ul>
              <p className="mt-2">
                You are solely responsible for the content (such as whisky ratings and tasting notes) you create or submit within the App.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">5. Ownership and Intellectual Property</h3>
              <p>
                All content, code, features, and functionality of the App (except user-generated content) are owned by The Dram Journal and protected by copyright, trademark, and other intellectual property laws. You are granted a limited, non-exclusive, non-transferable, revocable license to use the App for personal, non-commercial purposes.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">6. User-Generated Content</h3>
              <p>
                You retain ownership of your tasting notes, reviews, and other submissions ("User Content"). By posting or submitting User Content, you grant The Dram Journal a non-exclusive, worldwide, royalty-free license to display, host, and use that content within the App as necessary to operate and improve the service.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">7. Privacy</h3>
              <p>
                Your use of the App is also governed by our Privacy Policy, which explains how we collect and use personal information. Please review the Privacy Policy carefully to understand your rights and obligations.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">8. Subscription Fees (if applicable)</h3>
              <p>
                The App may offer free and paid features. Any fees or charges will be clearly disclosed before purchase. All payments are processed securely, and you are responsible for any applicable taxes or charges imposed by your payment provider.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">9. Termination of Use</h3>
              <p className="mb-2">
                We reserve the right to suspend or terminate your account at any time, without notice, if we believe you have violated these Terms or engaged in conduct harmful to other users or the integrity of the App.
              </p>
              <p>
                You may terminate your account at any time by deleting it within the App or by contacting us at{" "}
                <a href="mailto:thedramjournal@outlook.com" className="text-amber-600 hover:text-amber-700 underline">
                  thedramjournal@outlook.com
                </a>
                .
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">10. Disclaimers</h3>
              <p>
                The App and its content are provided "as is" and "as available" without warranties of any kind, whether express or implied. We do not guarantee that the App will be error-free, uninterrupted, or that the information provided (including whisky data) is accurate or complete.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">11. Limitation of Liability</h3>
              <p>
                To the fullest extent permitted by law, The Dram Journal and its affiliates, officers, and employees are not liable for any indirect, incidental, or consequential damages arising from your use of the App or inability to use the App, including loss of data or profits.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">12. Indemnification</h3>
              <p>
                You agree to indemnify and hold harmless The Dram Journal, its affiliates, and their respective officers and employees from any claim, loss, liability, or expense arising out of your use of the App, your violation of these Terms, or your infringement of any third-party rights.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">13. Modifications to the App or Terms</h3>
              <p>
                We may modify or update the App or these Terms at any time. Changes will be effective when posted in the App. Continued use of the App after such updates constitutes your acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">14. Governing Law</h3>
              <p>
                These Terms are governed by the laws of your jurisdiction of residence. For users in the United States, applicable federal and state laws apply. For users in the European Union, the United Kingdom, or Canada, applicable regional laws and consumer protection rights remain unaffected.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">15. Contact Us</h3>
              <p>
                If you have any questions about these Terms or the App, please contact us at:
              </p>
              <p className="mt-2">
                📧{" "}
                <a href="mailto:thedramjournal@outlook.com" className="text-amber-600 hover:text-amber-700 underline">
                  thedramjournal@outlook.com
                </a>
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
