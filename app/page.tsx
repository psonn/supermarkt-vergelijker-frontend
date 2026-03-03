import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import BoodschappenlijstForm from "@/components/BoodschappenlijstForm"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Supermarkt Vergelijker
          </h1>
          <p className="text-muted-foreground">
            Vergelijk real-time prijzen bij Albert Heijn, Jumbo, Dirk en meer.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Jouw boodschappenlijst</CardTitle>
            <CardDescription>
              Voer je producten in en zie direct waar je het goedkoopst uit bent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <BoodschappenlijstForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
