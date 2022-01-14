import * as cdk from '@aws-cdk/core';

import * as secretsManager from '@aws-cdk/aws-secretsmanager';

export interface SecretProps extends cdk.StackProps {
    repositoryId: string | undefined;
}

export class SecretStack extends cdk.Stack {

    public readonly webhookSecret: secretsManager.Secret;

    constructor(scope: cdk.Construct, id: string, props: SecretProps) {
        super(scope, id, props);

        let repositoryId = "repositoryId"
        if (props.repositoryId) {
            repositoryId = props.repositoryId
        }
        this.webhookSecret = new secretsManager.Secret(this, 'webhook-secret', {
            secretName: 'GITHUB_WEBHOOK_' + repositoryId
        });
    }
}
