type ACTORS = 'user' | 'dev' | 'space:sk' | 'space:pk';

type Space = {
    owner: string;
    name: string;
    did: string;
    url?: string | null;
    keys: { pk: string; sk: string };
    isActive: boolean;
};

type Dev = {
    name: string;
    email: string;
    provider: 'github' | 'google';
    picture: string;
};

type Auth = {
    token: string;
    isActive: boolean;
};

type User = {
    tg?: {
        id?: number | null;
        username?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        languageCode?: string | null;
        photoUrl?: string | null;
    };
    username: string;
    hasBlueTick: boolean;
    address: string;
    did: string;
    pfp?: string | null;
    bio?: string | null;
    socials?: {
        x?: string | null;
        yt?: string | null;
        tg?: string | null;
        other?: string | null;
    };
};

type Session = {
    user: string;
    device?: string | null;
    isActive: boolean;
};

type Base = {
    readonly _id: string;
    createdAt: string;
    updatedAt: string;
    _v: number;
};

type TransactionStream = {
    jsonrpc: string;
    method: string;
    params: {
        account_id: string;
        lt: number;
        tx_hash: string;
    };
};

type AccountStatus = 'nonexist' | 'uninit' | 'active' | 'frozen';

type TransactionType =
    | 'TransOrd'
    | 'TransTickTock'
    | 'TransSplitPrepare'
    | 'TransSplitInstall'
    | 'TransMergePrepare'
    | 'TransMergeInstall'
    | 'TransStorage';

type AccountAddress = {
    address: string;
    name?: string;
    is_scam: boolean;
    icon?: string;
    is_wallet: boolean;
};

type TransactionMessage = {
    msg_type: 'int_msg' | 'ext_in_msg' | 'ext_out_msg';
    created_lt: number;
    ihr_disabled: boolean;
    bounce: boolean;
    bounced: boolean;
    value: number;
    fwd_fee: number;
    ihr_fee: number;
    destination?: AccountAddress;
    source?: AccountAddress;
    import_fee: number;
    created_at: number;
    op_code?: string;
    init?: { boc: string };
    raw_body?: string;
    decoded_op_name?: string;
    decoded_body?: Record<string, any>;
};

type TxData = {
    hash: string;
    lt: number;
    account: AccountAddress;
    success: boolean;
    utime: number;
    orig_status: AccountStatus;
    end_status: AccountStatus;
    total_fees: number;
    end_balance: number;
    transaction_type: TransactionType;
    state_update_old: string;
    state_update_new: string;
    in_msg?: TransactionMessage;
    out_msgs: TransactionMessage[];
    block: string;
    prev_trans_hash?: string;
    prev_trans_lt?: number;
    compute_phase?: any;
    storage_phase?: any;
    credit_phase?: any;
    action_phase?: any;
    bounce_phase?: any;
    aborted: boolean;
    destroyed: boolean;
};

type NftItemPrice = {
    value: string;
    token_name: string;
};

type NftItemSale = {
    address: string;
    market: AccountAddress;
    owner?: AccountAddress;
    price: NftItemPrice;
};

type NftItem = {
    address: string;
    index: number;
    owner?: AccountAddress;
    collection?: {
        address: string;
        name: string;
        description: string;
    };
    verified: boolean;
    metadata: Record<string, any>;
    sale?: NftItemSale;
    previews?: [{ resolution: string; url: string }];
    dns?: string;
    approved_by: 'getgems' | 'tonkeeper' | 'ton.diamonds';
    include_cnft?: boolean;
    trust: 'whitelist' | 'graylist' | 'blacklist' | 'none';
};
