#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol,
};

// ── Storage Keys ──────────────────────────────────────────────────────────────
const KEY_GOAL: Symbol = symbol_short!("GOAL");
const KEY_RAISED: Symbol = symbol_short!("RAISED");
const KEY_COUNT: Symbol = symbol_short!("COUNT");
const KEY_LAST_AMT: Symbol = symbol_short!("LASTAMT");
const KEY_LAST_ADR: Symbol = symbol_short!("LASTADR");

// ── Events ────────────────────────────────────────────────────────────────────
const TOPIC_DONATION: Symbol = symbol_short!("DONATION");

// ── Return Type ───────────────────────────────────────────────────────────────
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct CampaignInfo {
    pub goal: i128,
    pub total_raised: i128,
    pub donor_count: u32,
    pub last_donation_amount: i128,
    pub last_donor_address: Option<Address>,
}

// ── Contract ──────────────────────────────────────────────────────────────────
#[contract]
pub struct FundFlowContract;

#[contractimpl]
impl FundFlowContract {
    /// Initialize the contract with a funding goal.
    /// Can only be called once — reverts if already initialized.
    pub fn initialize(env: Env, goal: i128) {
        assert!(goal > 0, "Goal must be positive");
        assert!(
            !env.storage().persistent().has(&KEY_GOAL),
            "Already initialized"
        );
        env.storage().persistent().set(&KEY_GOAL, &goal);
        env.storage().persistent().set(&KEY_RAISED, &0_i128);
        env.storage().persistent().set(&KEY_COUNT, &0_u32);
    }

    /// Record a donation.
    ///
    /// `donor`  — the wallet address of the donor (must authorize).
    /// `amount` — the amount in stroops (1 XLM = 10_000_000 stroops).
    pub fn donate(env: Env, donor: Address, amount: i128) {
        // Require the donor to authorize this call
        donor.require_auth();

        assert!(amount > 0, "Amount must be positive");
        assert!(
            env.storage().persistent().has(&KEY_GOAL),
            "Not initialized"
        );

        // Update state
        let raised: i128 = env.storage().persistent().get(&KEY_RAISED).unwrap_or(0);
        let count: u32 = env.storage().persistent().get(&KEY_COUNT).unwrap_or(0);

        env.storage()
            .persistent()
            .set(&KEY_RAISED, &(raised + amount));
        env.storage()
            .persistent()
            .set(&KEY_COUNT, &(count + 1));
        env.storage()
            .persistent()
            .set(&KEY_LAST_AMT, &amount);
        env.storage()
            .persistent()
            .set(&KEY_LAST_ADR, &donor);

        // Emit event
        env.events().publish(
            (TOPIC_DONATION, donor.clone()),
            amount,
        );
    }

    /// Return the full campaign state.
    pub fn get_campaign_info(env: Env) -> CampaignInfo {
        CampaignInfo {
            goal: env
                .storage()
                .persistent()
                .get(&KEY_GOAL)
                .unwrap_or(0),
            total_raised: env
                .storage()
                .persistent()
                .get(&KEY_RAISED)
                .unwrap_or(0),
            donor_count: env
                .storage()
                .persistent()
                .get(&KEY_COUNT)
                .unwrap_or(0),
            last_donation_amount: env
                .storage()
                .persistent()
                .get(&KEY_LAST_AMT)
                .unwrap_or(0),
            last_donor_address: env
                .storage()
                .persistent()
                .get(&KEY_LAST_ADR),
        }
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register_contract(None, FundFlowContract);
        let client = FundFlowContractClient::new(&env, &contract_id);

        client.initialize(&100_000_000_i128);

        let info = client.get_campaign_info();
        assert_eq!(info.goal, 100_000_000);
        assert_eq!(info.total_raised, 0);
        assert_eq!(info.donor_count, 0);
    }

    #[test]
    fn test_donate() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, FundFlowContract);
        let client = FundFlowContractClient::new(&env, &contract_id);

        client.initialize(&100_000_000_i128);

        let donor = Address::generate(&env);
        client.donate(&donor, &10_000_000_i128); // 1 XLM
        client.donate(&donor, &20_000_000_i128); // 2 XLM

        let info = client.get_campaign_info();
        assert_eq!(info.total_raised, 30_000_000);
        assert_eq!(info.donor_count, 2);
        assert_eq!(info.last_donation_amount, 20_000_000);
        assert_eq!(info.last_donor_address, Some(donor));
    }

    #[test]
    #[should_panic(expected = "Already initialized")]
    fn test_double_initialize() {
        let env = Env::default();
        let contract_id = env.register_contract(None, FundFlowContract);
        let client = FundFlowContractClient::new(&env, &contract_id);

        client.initialize(&100_000_000_i128);
        client.initialize(&200_000_000_i128); // should panic
    }

}
