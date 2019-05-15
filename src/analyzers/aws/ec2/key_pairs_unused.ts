import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class KeyPairsUnusedAnalyzer extends BaseAnalyzer {
    public checks_what : string ="Are there any key pairs unused?";
    public checks_why : string = "Unused key pairs causes confusion and allows to make mistakes";
    public checks_recommendation: string = "Recommended delete unused key pairs";
    public analyze(params: any, fullReport?: any): any {
        const allKeyPairs = params.key_pairs;
        const allInstances = params.instances;
        if (!allKeyPairs || !allInstances) {
            return undefined;
        }
        const key_pairs_unused: ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        key_pairs_unused.what = this.checks_what;
        key_pairs_unused.why = this.checks_why;
        key_pairs_unused.recommendation = this.checks_recommendation;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allInstances) {
            const regionInstances = allInstances[region];
            const regionKeyPairs = allKeyPairs[region];
            allRegionsAnalysis[region] = [];
            const usedKeyPairs = regionInstances.map((instance) => {
                return instance.KeyName;
            });
            if (!regionKeyPairs) {
                continue;
            }

            regionKeyPairs.forEach((keyPair) => {
                const keyPairAnalysis: IResourceAnalysisResult = {};
                keyPairAnalysis.resource = keyPair;
                keyPairAnalysis.resourceSummary = { name: "KeyPair", value: keyPair.KeyName };
                if (usedKeyPairs.indexOf(keyPair.KeyName) !== -1) {
                    keyPairAnalysis.severity = SeverityStatus.Good;
                    keyPairAnalysis.message = "Key pair is used";
                } else {
                    keyPairAnalysis.severity = SeverityStatus.Warning;
                    keyPairAnalysis.message = "Key pair is not used";
                    keyPairAnalysis.action = "Delete the key pair";
                }
                allRegionsAnalysis[region].push(keyPairAnalysis);
            });
        }
        key_pairs_unused.regions = allRegionsAnalysis;
        return { key_pairs_unused };
    }
}
