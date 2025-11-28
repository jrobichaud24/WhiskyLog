import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Contact() {
  return (
    <div className="min-h-screen bg-warmwhite">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-4" data-testid="heading-contact">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto" data-testid="text-contact-description">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto" data-testid="card-contact-form">
          <CardHeader>
            <CardTitle className="text-2xl">Send us a message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll respond as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSdAPjEbTiHHEEeU3RJXZWkKIfI-yLVRg0EB7C2NdSHpAbfsdg/viewform?embedded=true"
              width="100%"
              height="1257"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              title="Contact Form"
            >
              Loading…
            </iframe>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
