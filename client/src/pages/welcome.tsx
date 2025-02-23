import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
    Code2,
    CheckCircle,
    FileJson,
    MessageSquare,
    ArrowRight,
    Library,
    AlertTriangle,
} from "lucide-react";
import { FormattedMessage, useIntl } from "react-intl";

export default function Welcome() {
	const intl = useIntl();
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-16">
                {/* Site Overview Section */}
				<div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4">
                        <FormattedMessage id="welcome.title" />
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                        <FormattedMessage id="welcome.description" />
                    </p>
                    <p className="text-sm text-muted-foreground mb-8">
                        <FormattedMessage id="welcome.creator" />
                    </p>

                    {/* Warning Message */}
                    <Card className="bg-yellow-50 border-yellow-200 max-w-2xl mx-auto">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-yellow-800">
                                <AlertTriangle className="h-5 w-5" />
                                <p className="text-sm font-medium">
                                    <FormattedMessage id="welcome.warning" />
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Development Stages Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-center mb-6">
                        <FormattedMessage id="welcome.flow.title" />
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <Card>
                            <CardHeader>
                                <Library className="h-10 w-10 mb-2 text-primary" />
                                <CardTitle>
                                    <FormattedMessage id="welcome.stage1.title" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    <FormattedMessage id="welcome.stage1.description" />
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <MessageSquare className="h-10 w-10 mb-2 text-primary" />
                                <CardTitle>
                                    Stage 2: Runnable Conversations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Create structured, type-safe conversations
                                    using your schemas. Ensure AI responses
                                    match your defined interfaces for
                                    consistent, reliable interactions.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Features Overview Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-center mb-6">
                        Core Features
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader>
                                <Code2 className="h-10 w-10 mb-2 text-primary" />
                                <CardTitle>Natural to TypeScript</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Convert natural language descriptions into
                                    precise TypeScript interfaces with AI
                                    assistance.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <FileJson className="h-10 w-10 mb-2 text-primary" />
                                <CardTitle>Schema Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Store and manage your interfaces and schemas
                                    in a centralized repository for easy access.
                                </p>
                            </CardContent>
                        </Card>

						<Card>
                            <CardHeader>
                                <CheckCircle className="h-10 w-10 mb-2 text-primary" />
                                <CardTitle>Type-Safe Chats</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Ensure AI responses conform to your defined
                                    types for reliable, structured
                                    conversations.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <ArrowRight className="h-10 w-10 mb-2 text-primary" />
                                <CardTitle>SDK Integration</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Integrate validated schemas and type-safe
                                    conversations into your applications with
                                    our SDK.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="text-center">
                    <Link href="/prompt-to-interface">
                        <Button size="lg" className="mr-4">
                            Start with Stage 1
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
