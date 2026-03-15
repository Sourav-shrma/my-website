import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { Shield, Lock, Eye, Database, CheckCircle } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <PageHeader title="Privacy" />

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <Shield className="mx-auto h-16 w-16 text-primary" />
            <h1 className="mt-4 text-3xl font-bold text-foreground">Privacy & Anonymity</h1>
            <p className="mt-2 text-muted-foreground">Your privacy and safety are our top priorities</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="border-border">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>End-to-End Encryption</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  All your conversations and journal entries are encrypted using industry-standard encryption. Only you
                  can access your data.
                </CardDescription>
              </CardContent>
            </Card>



            <Card className="border-border">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-chart-3/10">
                  <Eye className="h-6 w-6 text-chart-3" />
                </div>
                <CardTitle>Private by Default</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  Your data is stored locally on your device by default. We never track your identity or share
                  information with third parties.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
                  <Database className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle>You Control Your Data</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  Delete your conversations and journal entries anytime. Your data belongs to you, and you have complete
                  control over it.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* How We Protect You */}
          <Card className="mt-8 border-border">
            <CardHeader>
              <CardTitle className="text-2xl">How We Protect Your Privacy</CardTitle>
              <CardDescription>Our commitment to keeping your information safe and anonymous</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">No Personal Identifiers</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    We don't collect names, emails, phone numbers, or any information that could identify you
                    personally.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Secure Communication</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    All data transmitted between your device and our servers uses HTTPS encryption to prevent
                    interception.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">No Third-Party Sharing</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    We never sell, rent, or share your data with advertisers, researchers, or any third parties. Your
                    information stays with you.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Local Storage First</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Your journal entries and preferences are stored on your device, giving you full control and offline
                    access.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Transparent AI Usage</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Our AI processes your messages to provide emotional support, but conversations are not used to train
                    models or improve other services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Important Notice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Talk To Me is designed to provide emotional support and is not a substitute for professional mental
                health care. If you are experiencing a mental health crisis, please contact a qualified mental health
                professional or crisis hotline immediately.
              </p>
              <p className="font-semibold text-foreground">
                Crisis Resources: National Suicide Prevention Lifeline: 9152987821  
              </p>
            </CardContent>
          </Card>

          {/* Credits Section */}
          <Card className="mt-8 border-border bg-gradient-to-br from-sky-50 to-blue-50">
            <CardContent className="py-8 text-center">
              <p className="text-lg font-semibold text-foreground mb-4">This project was developed by:</p>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-muted-foreground">
                <span className="font-medium text-foreground">Sourav Sharma</span>
                <span className="font-medium text-foreground">Sumit Kumar</span>
                <span className="font-medium text-foreground">Kavya Vyas</span>
                <span className="font-medium text-foreground">Niharika Sharma</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
