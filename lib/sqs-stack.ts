import * as sqs from '@aws-cdk/aws-sqs';
import * as cdk from '@aws-cdk/core';
import {Duration} from '@aws-cdk/core';
import * as lambdaEventSources from "@aws-cdk/aws-lambda-event-sources";
import * as lambda from "@aws-cdk/aws-lambda";

export interface SqsStackProps extends cdk.StackProps {
    visibilityTimeout: number;
}

export class SqsStack extends cdk.Stack {

    public readonly queue: sqs.Queue;
    public readonly sqsLambdaEventSource: lambda.IEventSource

    constructor(scope: cdk.Construct, id: string, props: SqsStackProps) {
        super(scope, id, props);
        this.queue = new sqs.Queue(this, 'drizzle-request-queue', {
            queueName: 'drizzle-request-queue',
            encryption: sqs.QueueEncryption.KMS_MANAGED,
            visibilityTimeout: Duration.minutes(props.visibilityTimeout)
        });

        this.sqsLambdaEventSource = new lambdaEventSources.SqsEventSource(this.queue, {
            batchSize: 1
        });
    }
}
