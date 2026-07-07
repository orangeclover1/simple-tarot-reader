import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ReadingProvider } from "@/lib/reading-context";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Read from "@/pages/read";
import ConfigureSpread from "@/pages/configure-spread";
import Draw from "@/pages/draw";
import Result from "@/pages/result";
import Library from "@/pages/library";
import CardDetail from "@/pages/card-detail";
import Journal from "@/pages/journal";
import Insights from "@/pages/insights";
import CustomDecks from "@/pages/custom-decks";
import CustomDeckEditor from "@/pages/custom-deck-editor";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/read" component={Read} />
      <Route path="/read/:spreadId" component={ConfigureSpread} />
      <Route path="/draw" component={Draw} />
      <Route path="/result" component={Result} />
      <Route path="/library" component={Library} />
      <Route path="/card/:id" component={CardDetail} />
      <Route path="/journal" component={Journal} />
      <Route path="/journal/:id" component={Journal} />
      <Route path="/insights" component={Insights} />
      <Route path="/custom-decks" component={CustomDecks} />
      <Route path="/custom-decks/:id" component={CustomDeckEditor} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ReadingProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL === "./" ? "" : import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </ReadingProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
