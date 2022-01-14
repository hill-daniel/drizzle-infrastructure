import * as cdk from '@aws-cdk/core';
import {DockerImage, Duration} from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as path from 'path';

export interface LambdaProps extends cdk.StackProps {
    webhookRequestQueueUrl: string;
    pipelineExecutionTimeOut: number;
}

export class LambdaStack extends cdk.Stack {

    public readonly webhookLambda: lambda.Function;
    public readonly pipelineLambda: lambda.Function;

    constructor(scope: cdk.Construct, id: string, props: LambdaProps) {
        super(scope, id, props);

        this.webhookLambda = new lambda.Function(this, 'drizzle-webhook', {
            functionName: 'drizzle-webhook',
            runtime: lambda.Runtime.GO_1_X,
            handler: 'webhook',
            environment: {
                MESSAGE_QUEUE_URL: props.webhookRequestQueueUrl,
            },
            timeout: Duration.seconds(10),
            code: lambda.Code.fromAsset(path.join(__dirname, '../../drizzle-webhook'), {
                bundling: {
                    image: DockerImage.fromRegistry('golang:1.17-alpine'),
                    user: "root",
                    environment: {
                        CGO_ENABLED: '0',
                        GOOS: 'linux',
                        GOARCH: 'amd64',
                    },
                    command: [
                        '/bin/sh', '-c', [
                            'go mod download',
                            'go mod verify',
                            'go build cmd/webhook/webhook.go',
                            'cp webhook /asset-output/',
                        ].join(' && ')
                    ]
                },
            }),
        })

        const dockerfile = path.join(__dirname, "../../drizzle/");
        this.pipelineLambda = new lambda.DockerImageFunction(this, 'drizzle-pipeline', {
            functionName: 'drizzle-pipeline',
            timeout: Duration.minutes(props.pipelineExecutionTimeOut),
            code: lambda.DockerImageCode.fromImageAsset(dockerfile),
            memorySize: 512,
            environment: {
                GOCACHE: '/tmp/gocache',
                GOMODCACHE: '/tmp/gomodcache',
                WORK_DIR: '/tmp',
            }
        })
    }
}
