const log4js = require('log4js');
const { Pool } = require("pg");
const chainConfigTable = 'chainlink_config';
const supportedChainsTable = 'supported_chains';
const submissionsTable = 'submissions';
const aggregatorTable = 'aggregator_chains';
const log = log4js.getLogger("Db");

class Db {
    constructor() {
        this.pool = new Pool();
        this.pgClient;
    }

    async connectDb() {
        log.info('connectDb');
        this.pgClient = await this.pool.connect();
    }

    async createTables() {
        log.info('createTables');
        // await this.pgClient.query(`drop table if exists ${submissionsTable} ;`);
        // await this.pgClient.query(
        //   `drop table if exists ${supportedChainsTable} ;`
        // );
        // await this.pgClient.query(`drop table if exists ${chainConfigTable} ;`);
    }

    async createChainConfig(
        chainId,
        cookie,
        eiChainlinkurl,
        eiIcAccesskey,
        eiIcSecret,
        eiCiAccesskey,
        eiCiSecret,
        mintJobId,
        burntJobId,
        network
    ) {
        log.info(`createChainConfig chainId: ${chainId}; cookie: ${cookie}; network: ${network}`);
        await this.pgClient.query(`insert into ${chainConfigTable} (
          chainId,
          cookie,
          eiChainlinkurl,
          eiIcAccesskey,
          eiIcSecret,
          eiCiAccesskey,
          eiCiSecret,
          mintJobId,
          burntJobId,
          network
        ) values(
          ${chainId},
          '${cookie}',
          '${eiChainlinkurl}',
          '${eiIcAccesskey}',
          '${eiIcSecret}',
          '${eiCiAccesskey}',
          '${eiCiSecret}',
          '${mintJobId}',
          '${burntJobId}',
          '${network}'
        ) on conflict do nothing;`);
    }

    async createSupportedChain(
        chainId,
        latestBlock,
        network,
        provider,
        debridgeAddr,
        interval
    ) {
        log.info(`createSupportedChain chainId: ${chainId}; latestBlock: ${latestBlock}; network: ${network}; provider: ${provider}; debridgeAddr: ${debridgeAddr}; interval: ${interval};`);
        await this.pgClient.query(`insert into ${supportedChainsTable} (
          chainId,
          latestBlock,
          network,
          provider,
          debridgeAddr,
          interval
        ) values(
          ${chainId},
          ${latestBlock},
          '${network}',
          '${provider}',
          '${debridgeAddr}',
          '${interval}'
        ) on conflict do nothing;`);
    }

    async createSubmission(
        submissionId,
        txHash,
        runId,
        chainFrom,
        chainTo,
        debridgeId,
        receiverAddr,
        amount,
        status
    ) {
        log.info(`createSubmission submissionId ${submissionId}; txHash: ${txHash}; runId: ${runId}`);
        await this.pgClient.query(`insert into ${submissionsTable} (
          submissionId,
          txHash,
          runId,
          chainFrom,
          chainTo,
          debridgeId,
          receiverAddr,
          amount,
          status
        ) values(
          '${submissionId}',
          ${txHash},
          '${runId}',
          ${chainFrom},
          ${chainTo},
          '${debridgeId}',
          '${receiverAddr}',
          ${amount},
          ${status}
        ) on conflict do nothing;`);
    }

    async getChainConfigs() {
        const result = await this.pgClient.query(
            `select * from ${chainConfigTable};`
        );
        return result.rows;
    }

    async getChainConfig(chainId) {
        const result = await this.pgClient.query(
            `select * from ${chainConfigTable} where chainId = ${chainId};`
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async getAggregatorConfig(chainId) {
        const result = await this.pgClient.query(
            `select * from ${aggregatorTable} where chainTo = ${chainId};`
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async getChainToForAggregator(aggregatorchain) {
        const result = await this.pgClient.query(
            `select * from ${aggregatorTable} where aggregatorchain = ${aggregatorchain};`
        );
        return result.rows;
    }
    async getSupportedChains() {
        const result = await this.pgClient.query(
            `select * from ${supportedChainsTable};`
        );
        return result.rows;
    }

    async getSupportedChain(chainId) {
        const result = await this.pgClient.query(
            `select * from ${supportedChainsTable} where chainid = ${chainId};`
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async getSubmissionsByStatus(status) {
        const result = await this.pgClient.query(
            `select * from ${submissionsTable} where status = ${status};`
        );
        return result.rows;
    }

    async getSubmissionsByStatusAndChainTo(status, chainsTo) {
        //log.debug(`select * from ${submissionsTable} where status = ${status} and chainto in (${chainsTo});`);
        const result = await this.pgClient.query(
            `select * from ${submissionsTable} where status = ${status} and chainto in (${chainsTo});`
        );
        return result.rows;
    }

    async getSubmission(submissionId) {
        const result = await this.pgClient
            .query(`select * from ${submissionsTable} 
        where submissionId = '${submissionId}';`);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async updateSupportedChainBlock(chainId, latestBlock) {
        log.info(`updateSupportedChainBlock chainId: ${chainId}; latestBlock: ${latestBlock}`);
        await this.pgClient.query(`update ${supportedChainsTable} set 
        latestBlock = ${latestBlock}
        where chainId = ${chainId};`);
    }

    async updateSubmissionStatus(submissionId, status) {
        log.info(`updateSubmissionStatus submissionId: ${submissionId}; status: ${status}`);
        await this.pgClient.query(`update ${submissionsTable} set 
        status = ${status}
        where submissionId = '${submissionId}';`);
    }

    async updateSubmissionTxHash(submissionId, txHash) {
        log.info(`updateSubmissionTxHash submissionId: ${submissionId}; txHash: ${txHash}`);
        await this.pgClient.query(`update ${submissionsTable} set 
        txHash = ${txHash}
        where submissionId = '${submissionId}';`);
    }

    async updateChainConfigCokie(chainId, cookie) {
        log.info(`updateChainConfigCokie chainId: ${chainId}; cookie: ${cookie}`);
        await this.pgClient.query(`update ${chainConfigTable} set 
        cookie = '${cookie}'
        where chainId = ${chainId};`);
    }
}

module.exports.Db = Db;
