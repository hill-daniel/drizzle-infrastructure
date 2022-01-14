#!/usr/bin/env node
import 'source-map-support/register';
import * as dotenv from 'dotenv'
import * as cdk from '@aws-cdk/core';
import {SqsStack} from "../lib/sqs-stack";
import {LambdaStack} from "../lib/lambda-stack";
import {ApiGatewayStack} from "../lib/api-gateway-stack";
import {SecretStack} from "../lib/secret-stack";

const app = new cdk.App();
dotenv.config();

const pipelineExecutionTimeoutInMinutes = 5;

const sqsStack = new SqsStack(app, "drizzle-sqs-stack", {
    // visibilityTimeout should be higher than the (reading) lambda execution timeout
    visibilityTimeout: pipelineExecutionTimeoutInMinutes + 1
});

const lambdaStack = new LambdaStack(app, "drizzle-lambda-stack", {
    webhookRequestQueueUrl: sqsStack.queue.queueUrl,
    pipelineExecutionTimeOut: pipelineExecutionTimeoutInMinutes
})

sqsStack.queue.grantSendMessages(lambdaStack.webhookLambda)
lambdaStack.pipelineLambda.addEventSource(sqsStack.sqsLambdaEventSource)

const apiGateway = new ApiGatewayStack(app, "drizzle-api-stack", {
    handler: lambdaStack.webhookLambda
})

const secretStack = new SecretStack(app, "drizzle-secret-stack", {
    repositoryId: process.env["REPOSITORY_ID"]
});
secretStack.webhookSecret.grantRead(lambdaStack.webhookLambda)