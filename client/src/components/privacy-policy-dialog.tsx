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

interface PrivacyPolicyDialogProps {
  trigger: React.ReactNode;
}

export default function PrivacyPolicyDialog({ trigger }: PrivacyPolicyDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]" data-testid="dialog-privacy-policy">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl text-gray-900">
            Privacy Policy
          </DialogTitle>
          <DialogDescription>
            Effective Date: October 2025 | Last Updated: October 2025
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm text-gray-700" data-testid="content-privacy-policy">
            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">1. Introduction</h3>
              <p>
                Welcome to The Dram Journal ("we," "our," or "us"). This Privacy Policy explains how we collect, use, and protect your personal information when you use our app (the "App"). The App allows users to explore information about whisky, record whiskies they have tried, rate them, and add tasting notes. By using the App, you agree to the terms of this Privacy Policy. If you do not agree, please do not use the App.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">2. Information We Collect</h3>
              <p className="mb-2">
                When you create an account and use the App, we collect the following information:
              </p>
              <div className="ml-4 space-y-2">
                <div>
                  <strong>Account Information:</strong>
                  <ul className="list-disc ml-6 mt-1">
                    <li>First name and last name</li>
                    <li>Email address</li>
                    <li>Username</li>
                    <li>Password (securely hashed and never stored in plain text)</li>
                  </ul>
                </div>
                <div>
                  <strong>User-Generated Content:</strong>
                  <ul className="list-disc ml-6 mt-1">
                    <li>Whisky ratings and tasting notes</li>
                    <li>Personal whisky collection or favorites list</li>
                  </ul>
                </div>
                <div>
                  <strong>Automatic Data (optional):</strong>
                  <p className="mt-1">
                    We may collect limited technical information (such as browser type, device type, and operating system) to improve performance and troubleshoot technical issues. This data does not include personally identifiable information.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">3. How We Use Your Information</h3>
              <p className="mb-2">We use your information to:</p>
              <ul className="list-disc ml-6">
                <li>Create and manage your user account</li>
                <li>Allow you to save, rate, and review whiskies</li>
                <li>Display your tasting notes and ratings within your account</li>
                <li>Improve and personalize the App experience</li>
                <li>Communicate with you about updates, features, or issues related to your account</li>
                <li>Maintain the security and integrity of our service</li>
              </ul>
              <p className="mt-2">
                We do not sell, rent, or share your personal data with third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">4. Legal Basis for Processing (GDPR Compliance)</h3>
              <p className="mb-2">
                If you are located in the European Union (EU), the European Economic Area (EEA), or the United Kingdom (UK), we process your personal data on the following legal bases:
              </p>
              <ul className="list-disc ml-6">
                <li>Your consent (Article 6(1)(a) GDPR)</li>
                <li>Performance of a contract (Article 6(1)(b) GDPR)</li>
                <li>Compliance with legal obligations (Article 6(1)(c) GDPR)</li>
                <li>Our legitimate interests, such as improving and maintaining our services (Article 6(1)(f) GDPR)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">5. Data Storage, Transfers, and Security</h3>
              <p className="mb-2">
                We use reasonable technical and organizational measures to protect your personal data against unauthorized access, loss, or misuse. Passwords are stored using industry-standard encryption methods.
              </p>
              <p className="mb-2">
                If you are located outside the country where our servers are located, your data may be transferred and processed in another country. Where required, we implement safeguards such as Standard Contractual Clauses (SCCs) approved by the European Commission or equivalent mechanisms for Canada and the United States.
              </p>
              <p>
                Please remember that no system is completely secure. You are responsible for keeping your login credentials confidential.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">6. Data Retention</h3>
              <p>
                We retain your account information and whisky records for as long as your account remains active. If you delete your account, your personal data and associated tasting notes will be permanently deleted from our systems within a reasonable timeframe.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">7. Your Rights</h3>
              <p className="mb-2">
                Depending on your location, you have specific rights under applicable privacy laws.
              </p>
              <div className="ml-4 space-y-2">
                <div>
                  <strong>Under GDPR (EU/EEA/UK):</strong>
                  <ul className="list-disc ml-6 mt-1">
                    <li>Right to access, correct, or delete your personal data</li>
                    <li>Right to data portability</li>
                    <li>Right to restrict or object to processing</li>
                    <li>Right to withdraw consent at any time</li>
                  </ul>
                </div>
                <div>
                  <strong>Under Canada's PIPEDA:</strong>
                  <ul className="list-disc ml-6 mt-1">
                    <li>Right to access and correct personal information</li>
                    <li>Right to challenge the accuracy of your information</li>
                    <li>Right to withdraw consent for data use</li>
                  </ul>
                </div>
                <div>
                  <strong>Under U.S. (where applicable state laws apply):</strong>
                  <ul className="list-disc ml-6 mt-1">
                    <li>Right to know what information is collected</li>
                    <li>Right to request deletion of your data</li>
                    <li>Right to opt out of data sharing (if applicable)</li>
                  </ul>
                </div>
              </div>
              <p className="mt-2">
                To exercise these rights, please contact us at{" "}
                <a href="mailto:thedramjournal@outlook.com" className="text-amber-600 hover:text-amber-700 underline">
                  thedramjournal@outlook.com
                </a>
                .
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">8. Cookies and Local Storage</h3>
              <p>
                The App may use browser-based storage (such as cookies or local storage) to maintain your login session and store preferences. These are used only to improve functionality and are not shared with third parties.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">9. Children's Privacy</h3>
              <p>
                This App is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that we have inadvertently collected such information, we will delete it promptly.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">10. Changes to This Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. Any changes will be posted in the App with an updated effective date. Continued use of the App after such updates constitutes your acceptance of the revised policy.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">11. Contact Us</h3>
              <p>
                If you have any questions or concerns about this Privacy Policy or how we handle your data, please contact us at:
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
