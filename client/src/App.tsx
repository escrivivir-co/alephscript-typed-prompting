import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { NavBar } from "@/components/nav-bar";
import Welcome from "@/pages/welcome";
import SchemaCreator from "@/pages/schema-creator";
import Repository from "@/pages/repository";
import Validator from "@/pages/validator";
import AIConfig from "@/pages/ai-config";
import PromptToInterface from "@/pages/prompt-to-interface";
import PromptWithSchema from "@/pages/prompt-with-schema";
import StructuredConversations from "@/pages/structured-conversations";
import SDKDocs from "@/pages/sdk-docs";
import SimpleMessageValidation from "@/pages/simple-message-validation";
import InterfaceToSchema from "@/pages/interface-to-schema";
import NotFound from "@/pages/not-found";
import { IntlProvider } from 'react-intl';
import { messages } from './localization/en';

function Router() {
    return (
        <Switch>
            <Route path="/" component={Welcome} />
            <Route path="/schema-creator" component={SchemaCreator} />
            <Route path="/repository" component={Repository} />
            <Route path="/validator" component={Validator} />
            <Route
                path="/simple-message-validation"
                component={SimpleMessageValidation}
            />
            <Route path="/ai-config" component={AIConfig} />
            <Route path="/prompt-to-interface" component={PromptToInterface} />
            <Route path="/prompt-with-schema" component={PromptWithSchema} />
            <Route
                path="/structured-conversations"
                component={StructuredConversations}
            />
            <Route path="/sdk-docs" component={SDKDocs} />
            <Route path="/interface-to-schema" component={InterfaceToSchema} />
            <Route component={NotFound} />
        </Switch>
    );
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<IntlProvider messages={messages} locale="en" defaultLocale="en">
				<div className="min-h-screen flex flex-col">
					<NavBar />
					<main className="flex-1">
						<Router />
					</main>
				</div>
				<Toaster />
			</IntlProvider>
		</QueryClientProvider>
	);
}

export default App;
