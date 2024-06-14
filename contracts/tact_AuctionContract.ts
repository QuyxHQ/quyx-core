import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue,
} from 'ton-core';

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
};

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    let sc_0 = slice;
    let _code = sc_0.loadRef();
    let _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

function loadTupleStateInit(source: TupleReader) {
    let _code = source.readCell();
    let _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

function storeTupleStateInit(source: StateInit) {
    let builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        },
    };
}

export type Context = {
    $$type: 'Context';
    bounced: boolean;
    sender: Address;
    value: bigint;
    raw: Cell;
};

export function storeContext(src: Context) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.bounced);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw);
    };
}

export function loadContext(slice: Slice) {
    let sc_0 = slice;
    let _bounced = sc_0.loadBit();
    let _sender = sc_0.loadAddress();
    let _value = sc_0.loadIntBig(257);
    let _raw = sc_0.loadRef();
    return {
        $$type: 'Context' as const,
        bounced: _bounced,
        sender: _sender,
        value: _value,
        raw: _raw,
    };
}

function loadTupleContext(source: TupleReader) {
    let _bounced = source.readBoolean();
    let _sender = source.readAddress();
    let _value = source.readBigNumber();
    let _raw = source.readCell();
    return {
        $$type: 'Context' as const,
        bounced: _bounced,
        sender: _sender,
        value: _value,
        raw: _raw,
    };
}

function storeTupleContext(source: Context) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.bounced);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw);
    return builder.build();
}

function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        },
    };
}

export type SendParameters = {
    $$type: 'SendParameters';
    bounce: boolean;
    to: Address;
    value: bigint;
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
};

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.bounce);
        b_0.storeAddress(src.to);
        b_0.storeInt(src.value, 257);
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) {
            b_0.storeBit(true).storeRef(src.body);
        } else {
            b_0.storeBit(false);
        }
        if (src.code !== null && src.code !== undefined) {
            b_0.storeBit(true).storeRef(src.code);
        } else {
            b_0.storeBit(false);
        }
        if (src.data !== null && src.data !== undefined) {
            b_0.storeBit(true).storeRef(src.data);
        } else {
            b_0.storeBit(false);
        }
    };
}

export function loadSendParameters(slice: Slice) {
    let sc_0 = slice;
    let _bounce = sc_0.loadBit();
    let _to = sc_0.loadAddress();
    let _value = sc_0.loadIntBig(257);
    let _mode = sc_0.loadIntBig(257);
    let _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    return {
        $$type: 'SendParameters' as const,
        bounce: _bounce,
        to: _to,
        value: _value,
        mode: _mode,
        body: _body,
        code: _code,
        data: _data,
    };
}

function loadTupleSendParameters(source: TupleReader) {
    let _bounce = source.readBoolean();
    let _to = source.readAddress();
    let _value = source.readBigNumber();
    let _mode = source.readBigNumber();
    let _body = source.readCellOpt();
    let _code = source.readCellOpt();
    let _data = source.readCellOpt();
    return {
        $$type: 'SendParameters' as const,
        bounce: _bounce,
        to: _to,
        value: _value,
        mode: _mode,
        body: _body,
        code: _code,
        data: _data,
    };
}

function storeTupleSendParameters(source: SendParameters) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.bounce);
    builder.writeAddress(source.to);
    builder.writeNumber(source.value);
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        },
    };
}

export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
};

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) {
        throw Error('Invalid prefix');
    }
    let _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

function loadTupleDeploy(source: TupleReader) {
    let _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

function storeTupleDeploy(source: Deploy) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        },
    };
}

export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
};

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) {
        throw Error('Invalid prefix');
    }
    let _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

function loadTupleDeployOk(source: TupleReader) {
    let _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

function storeTupleDeployOk(source: DeployOk) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        },
    };
}

export type FactoryDeploy = {
    $$type: 'FactoryDeploy';
    queryId: bigint;
    cashback: Address;
};

export function storeFactoryDeploy(src: FactoryDeploy) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}

export function loadFactoryDeploy(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) {
        throw Error('Invalid prefix');
    }
    let _queryId = sc_0.loadUintBig(64);
    let _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

function loadTupleFactoryDeploy(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

function storeTupleFactoryDeploy(source: FactoryDeploy) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}

function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadFactoryDeploy(src.loadRef().beginParse());
        },
    };
}

export type GetRoyaltyParams = {
    $$type: 'GetRoyaltyParams';
    query_id: bigint;
};

export function storeGetRoyaltyParams(src: GetRoyaltyParams) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1765620048, 32);
        b_0.storeUint(src.query_id, 64);
    };
}

export function loadGetRoyaltyParams(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1765620048) {
        throw Error('Invalid prefix');
    }
    let _query_id = sc_0.loadUintBig(64);
    return { $$type: 'GetRoyaltyParams' as const, query_id: _query_id };
}

function loadTupleGetRoyaltyParams(source: TupleReader) {
    let _query_id = source.readBigNumber();
    return { $$type: 'GetRoyaltyParams' as const, query_id: _query_id };
}

function storeTupleGetRoyaltyParams(source: GetRoyaltyParams) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    return builder.build();
}

function dictValueParserGetRoyaltyParams(): DictionaryValue<GetRoyaltyParams> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeGetRoyaltyParams(src)).endCell());
        },
        parse: (src) => {
            return loadGetRoyaltyParams(src.loadRef().beginParse());
        },
    };
}

export type ReportRoyaltyParams = {
    $$type: 'ReportRoyaltyParams';
    query_id: bigint;
    numerator: bigint;
    denominator: bigint;
    destination: Address;
};

export function storeReportRoyaltyParams(src: ReportRoyaltyParams) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2831876269, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeUint(src.numerator, 16);
        b_0.storeUint(src.denominator, 16);
        b_0.storeAddress(src.destination);
    };
}

export function loadReportRoyaltyParams(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2831876269) {
        throw Error('Invalid prefix');
    }
    let _query_id = sc_0.loadUintBig(64);
    let _numerator = sc_0.loadUintBig(16);
    let _denominator = sc_0.loadUintBig(16);
    let _destination = sc_0.loadAddress();
    return {
        $$type: 'ReportRoyaltyParams' as const,
        query_id: _query_id,
        numerator: _numerator,
        denominator: _denominator,
        destination: _destination,
    };
}

function loadTupleReportRoyaltyParams(source: TupleReader) {
    let _query_id = source.readBigNumber();
    let _numerator = source.readBigNumber();
    let _denominator = source.readBigNumber();
    let _destination = source.readAddress();
    return {
        $$type: 'ReportRoyaltyParams' as const,
        query_id: _query_id,
        numerator: _numerator,
        denominator: _denominator,
        destination: _destination,
    };
}

function storeTupleReportRoyaltyParams(source: ReportRoyaltyParams) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeNumber(source.numerator);
    builder.writeNumber(source.denominator);
    builder.writeAddress(source.destination);
    return builder.build();
}

function dictValueParserReportRoyaltyParams(): DictionaryValue<ReportRoyaltyParams> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeReportRoyaltyParams(src)).endCell());
        },
        parse: (src) => {
            return loadReportRoyaltyParams(src.loadRef().beginParse());
        },
    };
}

export type FillUp = {
    $$type: 'FillUp';
    query_id: bigint;
};

export function storeFillUp(src: FillUp) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(923790417, 32);
        b_0.storeUint(src.query_id, 64);
    };
}

export function loadFillUp(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 923790417) {
        throw Error('Invalid prefix');
    }
    let _query_id = sc_0.loadUintBig(64);
    return { $$type: 'FillUp' as const, query_id: _query_id };
}

function loadTupleFillUp(source: TupleReader) {
    let _query_id = source.readBigNumber();
    return { $$type: 'FillUp' as const, query_id: _query_id };
}

function storeTupleFillUp(source: FillUp) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    return builder.build();
}

function dictValueParserFillUp(): DictionaryValue<FillUp> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeFillUp(src)).endCell());
        },
        parse: (src) => {
            return loadFillUp(src.loadRef().beginParse());
        },
    };
}

export type ClaimUsername = {
    $$type: 'ClaimUsername';
    query_id: bigint;
    domain: string;
    content: Cell;
};

export function storeClaimUsername(src: ClaimUsername) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1474634135, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeStringRefTail(src.domain);
        b_0.storeRef(src.content);
    };
}

export function loadClaimUsername(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1474634135) {
        throw Error('Invalid prefix');
    }
    let _query_id = sc_0.loadUintBig(64);
    let _domain = sc_0.loadStringRefTail();
    let _content = sc_0.loadRef();
    return {
        $$type: 'ClaimUsername' as const,
        query_id: _query_id,
        domain: _domain,
        content: _content,
    };
}

function loadTupleClaimUsername(source: TupleReader) {
    let _query_id = source.readBigNumber();
    let _domain = source.readString();
    let _content = source.readCell();
    return {
        $$type: 'ClaimUsername' as const,
        query_id: _query_id,
        domain: _domain,
        content: _content,
    };
}

function storeTupleClaimUsername(source: ClaimUsername) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeString(source.domain);
    builder.writeCell(source.content);
    return builder.build();
}

function dictValueParserClaimUsername(): DictionaryValue<ClaimUsername> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeClaimUsername(src)).endCell());
        },
        parse: (src) => {
            return loadClaimUsername(src.loadRef().beginParse());
        },
    };
}

export type NftItemDeploy = {
    $$type: 'NftItemDeploy';
    query_id: bigint;
    owner: Address;
    domain: string;
    content: Cell;
};

export function storeNftItemDeploy(src: NftItemDeploy) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1481937446, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeAddress(src.owner);
        b_0.storeStringRefTail(src.domain);
        b_0.storeRef(src.content);
    };
}

export function loadNftItemDeploy(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1481937446) {
        throw Error('Invalid prefix');
    }
    let _query_id = sc_0.loadUintBig(64);
    let _owner = sc_0.loadAddress();
    let _domain = sc_0.loadStringRefTail();
    let _content = sc_0.loadRef();
    return {
        $$type: 'NftItemDeploy' as const,
        query_id: _query_id,
        owner: _owner,
        domain: _domain,
        content: _content,
    };
}

function loadTupleNftItemDeploy(source: TupleReader) {
    let _query_id = source.readBigNumber();
    let _owner = source.readAddress();
    let _domain = source.readString();
    let _content = source.readCell();
    return {
        $$type: 'NftItemDeploy' as const,
        query_id: _query_id,
        owner: _owner,
        domain: _domain,
        content: _content,
    };
}

function storeTupleNftItemDeploy(source: NftItemDeploy) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeAddress(source.owner);
    builder.writeString(source.domain);
    builder.writeCell(source.content);
    return builder.build();
}

function dictValueParserNftItemDeploy(): DictionaryValue<NftItemDeploy> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeNftItemDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadNftItemDeploy(src.loadRef().beginParse());
        },
    };
}

export type OutbidNotification = {
    $$type: 'OutbidNotification';
    query_id: bigint;
};

export function storeOutbidNotification(src: OutbidNotification) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1434249760, 32);
        b_0.storeUint(src.query_id, 64);
    };
}

export function loadOutbidNotification(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1434249760) {
        throw Error('Invalid prefix');
    }
    let _query_id = sc_0.loadUintBig(64);
    return { $$type: 'OutbidNotification' as const, query_id: _query_id };
}

function loadTupleOutbidNotification(source: TupleReader) {
    let _query_id = source.readBigNumber();
    return { $$type: 'OutbidNotification' as const, query_id: _query_id };
}

function storeTupleOutbidNotification(source: OutbidNotification) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    return builder.build();
}

function dictValueParserOutbidNotification(): DictionaryValue<OutbidNotification> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeOutbidNotification(src)).endCell());
        },
        parse: (src) => {
            return loadOutbidNotification(src.loadRef().beginParse());
        },
    };
}

export type CompleteAuction = {
    $$type: 'CompleteAuction';
    query_id: bigint;
};

export function storeCompleteAuction(src: CompleteAuction) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1878586964, 32);
        b_0.storeUint(src.query_id, 64);
    };
}

export function loadCompleteAuction(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1878586964) {
        throw Error('Invalid prefix');
    }
    let _query_id = sc_0.loadUintBig(64);
    return { $$type: 'CompleteAuction' as const, query_id: _query_id };
}

function loadTupleCompleteAuction(source: TupleReader) {
    let _query_id = source.readBigNumber();
    return { $$type: 'CompleteAuction' as const, query_id: _query_id };
}

function storeTupleCompleteAuction(source: CompleteAuction) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    return builder.build();
}

function dictValueParserCompleteAuction(): DictionaryValue<CompleteAuction> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeCompleteAuction(src)).endCell());
        },
        parse: (src) => {
            return loadCompleteAuction(src.loadRef().beginParse());
        },
    };
}

export type Transfer = {
    $$type: 'Transfer';
    query_id: bigint;
    new_owner: Address;
    response_destination: Address;
    custom_payload: Cell | null;
    forward_amount: bigint;
    forward_payload: Cell;
};

export function storeTransfer(src: Transfer) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1607220500, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeAddress(src.new_owner);
        b_0.storeAddress(src.response_destination);
        if (src.custom_payload !== null && src.custom_payload !== undefined) {
            b_0.storeBit(true).storeRef(src.custom_payload);
        } else {
            b_0.storeBit(false);
        }
        b_0.storeCoins(src.forward_amount);
        b_0.storeBuilder(src.forward_payload.asBuilder());
    };
}

export function loadTransfer(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1607220500) {
        throw Error('Invalid prefix');
    }
    let _query_id = sc_0.loadUintBig(64);
    let _new_owner = sc_0.loadAddress();
    let _response_destination = sc_0.loadAddress();
    let _custom_payload = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _forward_amount = sc_0.loadCoins();
    let _forward_payload = sc_0.asCell();
    return {
        $$type: 'Transfer' as const,
        query_id: _query_id,
        new_owner: _new_owner,
        response_destination: _response_destination,
        custom_payload: _custom_payload,
        forward_amount: _forward_amount,
        forward_payload: _forward_payload,
    };
}

function loadTupleTransfer(source: TupleReader) {
    let _query_id = source.readBigNumber();
    let _new_owner = source.readAddress();
    let _response_destination = source.readAddress();
    let _custom_payload = source.readCellOpt();
    let _forward_amount = source.readBigNumber();
    let _forward_payload = source.readCell();
    return {
        $$type: 'Transfer' as const,
        query_id: _query_id,
        new_owner: _new_owner,
        response_destination: _response_destination,
        custom_payload: _custom_payload,
        forward_amount: _forward_amount,
        forward_payload: _forward_payload,
    };
}

function storeTupleTransfer(source: Transfer) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeAddress(source.new_owner);
    builder.writeAddress(source.response_destination);
    builder.writeCell(source.custom_payload);
    builder.writeNumber(source.forward_amount);
    builder.writeSlice(source.forward_payload);
    return builder.build();
}

function dictValueParserTransfer(): DictionaryValue<Transfer> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeTransfer(src)).endCell());
        },
        parse: (src) => {
            return loadTransfer(src.loadRef().beginParse());
        },
    };
}

export type Excesses = {
    $$type: 'Excesses';
    query_id: bigint;
};

export function storeExcesses(src: Excesses) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3576854235, 32);
        b_0.storeUint(src.query_id, 64);
    };
}

export function loadExcesses(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3576854235) {
        throw Error('Invalid prefix');
    }
    let _query_id = sc_0.loadUintBig(64);
    return { $$type: 'Excesses' as const, query_id: _query_id };
}

function loadTupleExcesses(source: TupleReader) {
    let _query_id = source.readBigNumber();
    return { $$type: 'Excesses' as const, query_id: _query_id };
}

function storeTupleExcesses(source: Excesses) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    return builder.build();
}

function dictValueParserExcesses(): DictionaryValue<Excesses> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeExcesses(src)).endCell());
        },
        parse: (src) => {
            return loadExcesses(src.loadRef().beginParse());
        },
    };
}

export type OwnershipAssigned = {
    $$type: 'OwnershipAssigned';
    query_id: bigint;
    prev_owner: Address;
    forward_payload: Cell;
};

export function storeOwnershipAssigned(src: OwnershipAssigned) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(85167505, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeAddress(src.prev_owner);
        b_0.storeBuilder(src.forward_payload.asBuilder());
    };
}

export function loadOwnershipAssigned(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 85167505) {
        throw Error('Invalid prefix');
    }
    let _query_id = sc_0.loadUintBig(64);
    let _prev_owner = sc_0.loadAddress();
    let _forward_payload = sc_0.asCell();
    return {
        $$type: 'OwnershipAssigned' as const,
        query_id: _query_id,
        prev_owner: _prev_owner,
        forward_payload: _forward_payload,
    };
}

function loadTupleOwnershipAssigned(source: TupleReader) {
    let _query_id = source.readBigNumber();
    let _prev_owner = source.readAddress();
    let _forward_payload = source.readCell();
    return {
        $$type: 'OwnershipAssigned' as const,
        query_id: _query_id,
        prev_owner: _prev_owner,
        forward_payload: _forward_payload,
    };
}

function storeTupleOwnershipAssigned(source: OwnershipAssigned) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeAddress(source.prev_owner);
    builder.writeSlice(source.forward_payload);
    return builder.build();
}

function dictValueParserOwnershipAssigned(): DictionaryValue<OwnershipAssigned> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeOwnershipAssigned(src)).endCell());
        },
        parse: (src) => {
            return loadOwnershipAssigned(src.loadRef().beginParse());
        },
    };
}

export type GetStaticData = {
    $$type: 'GetStaticData';
    query_id: bigint;
};

export function storeGetStaticData(src: GetStaticData) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(801842850, 32);
        b_0.storeUint(src.query_id, 64);
    };
}

export function loadGetStaticData(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 801842850) {
        throw Error('Invalid prefix');
    }
    let _query_id = sc_0.loadUintBig(64);
    return { $$type: 'GetStaticData' as const, query_id: _query_id };
}

function loadTupleGetStaticData(source: TupleReader) {
    let _query_id = source.readBigNumber();
    return { $$type: 'GetStaticData' as const, query_id: _query_id };
}

function storeTupleGetStaticData(source: GetStaticData) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    return builder.build();
}

function dictValueParserGetStaticData(): DictionaryValue<GetStaticData> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeGetStaticData(src)).endCell());
        },
        parse: (src) => {
            return loadGetStaticData(src.loadRef().beginParse());
        },
    };
}

export type ReportStaticData = {
    $$type: 'ReportStaticData';
    query_id: bigint;
    index: bigint;
    collection: Address;
};

export function storeReportStaticData(src: ReportStaticData) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2339837749, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeUint(src.index, 256);
        b_0.storeAddress(src.collection);
    };
}

export function loadReportStaticData(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2339837749) {
        throw Error('Invalid prefix');
    }
    let _query_id = sc_0.loadUintBig(64);
    let _index = sc_0.loadUintBig(256);
    let _collection = sc_0.loadAddress();
    return {
        $$type: 'ReportStaticData' as const,
        query_id: _query_id,
        index: _index,
        collection: _collection,
    };
}

function loadTupleReportStaticData(source: TupleReader) {
    let _query_id = source.readBigNumber();
    let _index = source.readBigNumber();
    let _collection = source.readAddress();
    return {
        $$type: 'ReportStaticData' as const,
        query_id: _query_id,
        index: _index,
        collection: _collection,
    };
}

function storeTupleReportStaticData(source: ReportStaticData) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeNumber(source.index);
    builder.writeAddress(source.collection);
    return builder.build();
}

function dictValueParserReportStaticData(): DictionaryValue<ReportStaticData> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeReportStaticData(src)).endCell());
        },
        parse: (src) => {
            return loadReportStaticData(src.loadRef().beginParse());
        },
    };
}

export type PutForSale = {
    $$type: 'PutForSale';
    query_id: bigint;
    action: bigint;
    sale_address: Address;
};

export function storePutForSale(src: PutForSale) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1910901130, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeUint(src.action, 8);
        b_0.storeAddress(src.sale_address);
    };
}

export function loadPutForSale(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1910901130) {
        throw Error('Invalid prefix');
    }
    let _query_id = sc_0.loadUintBig(64);
    let _action = sc_0.loadUintBig(8);
    let _sale_address = sc_0.loadAddress();
    return {
        $$type: 'PutForSale' as const,
        query_id: _query_id,
        action: _action,
        sale_address: _sale_address,
    };
}

function loadTuplePutForSale(source: TupleReader) {
    let _query_id = source.readBigNumber();
    let _action = source.readBigNumber();
    let _sale_address = source.readAddress();
    return {
        $$type: 'PutForSale' as const,
        query_id: _query_id,
        action: _action,
        sale_address: _sale_address,
    };
}

function storeTuplePutForSale(source: PutForSale) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeNumber(source.action);
    builder.writeAddress(source.sale_address);
    return builder.build();
}

function dictValueParserPutForSale(): DictionaryValue<PutForSale> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storePutForSale(src)).endCell());
        },
        parse: (src) => {
            return loadPutForSale(src.loadRef().beginParse());
        },
    };
}

export type CancelAuction = {
    $$type: 'CancelAuction';
    query_id: bigint;
};

export function storeCancelAuction(src: CancelAuction) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(422837155, 32);
        b_0.storeUint(src.query_id, 64);
    };
}

export function loadCancelAuction(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 422837155) {
        throw Error('Invalid prefix');
    }
    let _query_id = sc_0.loadUintBig(64);
    return { $$type: 'CancelAuction' as const, query_id: _query_id };
}

function loadTupleCancelAuction(source: TupleReader) {
    let _query_id = source.readBigNumber();
    return { $$type: 'CancelAuction' as const, query_id: _query_id };
}

function storeTupleCancelAuction(source: CancelAuction) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    return builder.build();
}

function dictValueParserCancelAuction(): DictionaryValue<CancelAuction> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeCancelAuction(src)).endCell());
        },
        parse: (src) => {
            return loadCancelAuction(src.loadRef().beginParse());
        },
    };
}

export type StopAuction = {
    $$type: 'StopAuction';
    query_id: bigint;
};

export function storeStopAuction(src: StopAuction) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1455875007, 32);
        b_0.storeUint(src.query_id, 64);
    };
}

export function loadStopAuction(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1455875007) {
        throw Error('Invalid prefix');
    }
    let _query_id = sc_0.loadUintBig(64);
    return { $$type: 'StopAuction' as const, query_id: _query_id };
}

function loadTupleStopAuction(source: TupleReader) {
    let _query_id = source.readBigNumber();
    return { $$type: 'StopAuction' as const, query_id: _query_id };
}

function storeTupleStopAuction(source: StopAuction) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    return builder.build();
}

function dictValueParserStopAuction(): DictionaryValue<StopAuction> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeStopAuction(src)).endCell());
        },
        parse: (src) => {
            return loadStopAuction(src.loadRef().beginParse());
        },
    };
}

export type NewBid = {
    $$type: 'NewBid';
    query_id: bigint;
};

export function storeNewBid(src: NewBid) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(777291430, 32);
        b_0.storeUint(src.query_id, 64);
    };
}

export function loadNewBid(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 777291430) {
        throw Error('Invalid prefix');
    }
    let _query_id = sc_0.loadUintBig(64);
    return { $$type: 'NewBid' as const, query_id: _query_id };
}

function loadTupleNewBid(source: TupleReader) {
    let _query_id = source.readBigNumber();
    return { $$type: 'NewBid' as const, query_id: _query_id };
}

function storeTupleNewBid(source: NewBid) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    return builder.build();
}

function dictValueParserNewBid(): DictionaryValue<NewBid> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeNewBid(src)).endCell());
        },
        parse: (src) => {
            return loadNewBid(src.loadRef().beginParse());
        },
    };
}

export type CancelSale = {
    $$type: 'CancelSale';
    query_id: bigint;
};

export function storeCancelSale(src: CancelSale) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1122373953, 32);
        b_0.storeUint(src.query_id, 32);
    };
}

export function loadCancelSale(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1122373953) {
        throw Error('Invalid prefix');
    }
    let _query_id = sc_0.loadUintBig(32);
    return { $$type: 'CancelSale' as const, query_id: _query_id };
}

function loadTupleCancelSale(source: TupleReader) {
    let _query_id = source.readBigNumber();
    return { $$type: 'CancelSale' as const, query_id: _query_id };
}

function storeTupleCancelSale(source: CancelSale) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    return builder.build();
}

function dictValueParserCancelSale(): DictionaryValue<CancelSale> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeCancelSale(src)).endCell());
        },
        parse: (src) => {
            return loadCancelSale(src.loadRef().beginParse());
        },
    };
}

export type BuyNFT = {
    $$type: 'BuyNFT';
    query_id: bigint;
};

export function storeBuyNFT(src: BuyNFT) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1685477321, 32);
        b_0.storeUint(src.query_id, 32);
    };
}

export function loadBuyNFT(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1685477321) {
        throw Error('Invalid prefix');
    }
    let _query_id = sc_0.loadUintBig(32);
    return { $$type: 'BuyNFT' as const, query_id: _query_id };
}

function loadTupleBuyNFT(source: TupleReader) {
    let _query_id = source.readBigNumber();
    return { $$type: 'BuyNFT' as const, query_id: _query_id };
}

function storeTupleBuyNFT(source: BuyNFT) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    return builder.build();
}

function dictValueParserBuyNFT(): DictionaryValue<BuyNFT> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeBuyNFT(src)).endCell());
        },
        parse: (src) => {
            return loadBuyNFT(src.loadRef().beginParse());
        },
    };
}

export type NftCollectionData = {
    $$type: 'NftCollectionData';
    next_item_index: bigint;
    collection_content: Cell;
    owner_address: Address;
};

export function storeNftCollectionData(src: NftCollectionData) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeInt(src.next_item_index, 257);
        b_0.storeRef(src.collection_content);
        b_0.storeAddress(src.owner_address);
    };
}

export function loadNftCollectionData(slice: Slice) {
    let sc_0 = slice;
    let _next_item_index = sc_0.loadIntBig(257);
    let _collection_content = sc_0.loadRef();
    let _owner_address = sc_0.loadAddress();
    return {
        $$type: 'NftCollectionData' as const,
        next_item_index: _next_item_index,
        collection_content: _collection_content,
        owner_address: _owner_address,
    };
}

function loadTupleNftCollectionData(source: TupleReader) {
    let _next_item_index = source.readBigNumber();
    let _collection_content = source.readCell();
    let _owner_address = source.readAddress();
    return {
        $$type: 'NftCollectionData' as const,
        next_item_index: _next_item_index,
        collection_content: _collection_content,
        owner_address: _owner_address,
    };
}

function storeTupleNftCollectionData(source: NftCollectionData) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.next_item_index);
    builder.writeCell(source.collection_content);
    builder.writeAddress(source.owner_address);
    return builder.build();
}

function dictValueParserNftCollectionData(): DictionaryValue<NftCollectionData> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeNftCollectionData(src)).endCell());
        },
        parse: (src) => {
            return loadNftCollectionData(src.loadRef().beginParse());
        },
    };
}

export type RoyaltyParams = {
    $$type: 'RoyaltyParams';
    numerator: bigint;
    denominator: bigint;
    destination: Address;
};

export function storeRoyaltyParams(src: RoyaltyParams) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(src.numerator, 16);
        b_0.storeUint(src.denominator, 16);
        b_0.storeAddress(src.destination);
    };
}

export function loadRoyaltyParams(slice: Slice) {
    let sc_0 = slice;
    let _numerator = sc_0.loadUintBig(16);
    let _denominator = sc_0.loadUintBig(16);
    let _destination = sc_0.loadAddress();
    return {
        $$type: 'RoyaltyParams' as const,
        numerator: _numerator,
        denominator: _denominator,
        destination: _destination,
    };
}

function loadTupleRoyaltyParams(source: TupleReader) {
    let _numerator = source.readBigNumber();
    let _denominator = source.readBigNumber();
    let _destination = source.readAddress();
    return {
        $$type: 'RoyaltyParams' as const,
        numerator: _numerator,
        denominator: _denominator,
        destination: _destination,
    };
}

function storeTupleRoyaltyParams(source: RoyaltyParams) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.numerator);
    builder.writeNumber(source.denominator);
    builder.writeAddress(source.destination);
    return builder.build();
}

function dictValueParserRoyaltyParams(): DictionaryValue<RoyaltyParams> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeRoyaltyParams(src)).endCell());
        },
        parse: (src) => {
            return loadRoyaltyParams(src.loadRef().beginParse());
        },
    };
}

export type PriceRangeConfig = {
    $$type: 'PriceRangeConfig';
    start: bigint;
    end: bigint;
};

export function storePriceRangeConfig(src: PriceRangeConfig) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeInt(src.start, 257);
        b_0.storeInt(src.end, 257);
    };
}

export function loadPriceRangeConfig(slice: Slice) {
    let sc_0 = slice;
    let _start = sc_0.loadIntBig(257);
    let _end = sc_0.loadIntBig(257);
    return { $$type: 'PriceRangeConfig' as const, start: _start, end: _end };
}

function loadTuplePriceRangeConfig(source: TupleReader) {
    let _start = source.readBigNumber();
    let _end = source.readBigNumber();
    return { $$type: 'PriceRangeConfig' as const, start: _start, end: _end };
}

function storeTuplePriceRangeConfig(source: PriceRangeConfig) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.start);
    builder.writeNumber(source.end);
    return builder.build();
}

function dictValueParserPriceRangeConfig(): DictionaryValue<PriceRangeConfig> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storePriceRangeConfig(src)).endCell());
        },
        parse: (src) => {
            return loadPriceRangeConfig(src.loadRef().beginParse());
        },
    };
}

export type AuctionInfo = {
    $$type: 'AuctionInfo';
    max_bid_address: Address | null;
    max_bid_amount: bigint;
    auction_end_time: bigint;
};

export function storeAuctionInfo(src: AuctionInfo) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeAddress(src.max_bid_address);
        b_0.storeCoins(src.max_bid_amount);
        b_0.storeUint(src.auction_end_time, 64);
    };
}

export function loadAuctionInfo(slice: Slice) {
    let sc_0 = slice;
    let _max_bid_address = sc_0.loadMaybeAddress();
    let _max_bid_amount = sc_0.loadCoins();
    let _auction_end_time = sc_0.loadUintBig(64);
    return {
        $$type: 'AuctionInfo' as const,
        max_bid_address: _max_bid_address,
        max_bid_amount: _max_bid_amount,
        auction_end_time: _auction_end_time,
    };
}

function loadTupleAuctionInfo(source: TupleReader) {
    let _max_bid_address = source.readAddressOpt();
    let _max_bid_amount = source.readBigNumber();
    let _auction_end_time = source.readBigNumber();
    return {
        $$type: 'AuctionInfo' as const,
        max_bid_address: _max_bid_address,
        max_bid_amount: _max_bid_amount,
        auction_end_time: _auction_end_time,
    };
}

function storeTupleAuctionInfo(source: AuctionInfo) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.max_bid_address);
    builder.writeNumber(source.max_bid_amount);
    builder.writeNumber(source.auction_end_time);
    return builder.build();
}

function dictValueParserAuctionInfo(): DictionaryValue<AuctionInfo> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeAuctionInfo(src)).endCell());
        },
        parse: (src) => {
            return loadAuctionInfo(src.loadRef().beginParse());
        },
    };
}

export type NftItemData = {
    $$type: 'NftItemData';
    is_initialized: boolean;
    index: bigint;
    collection_address: Address;
    owner: Address;
    content: Cell;
};

export function storeNftItemData(src: NftItemData) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.is_initialized);
        b_0.storeUint(src.index, 256);
        b_0.storeAddress(src.collection_address);
        b_0.storeAddress(src.owner);
        b_0.storeRef(src.content);
    };
}

export function loadNftItemData(slice: Slice) {
    let sc_0 = slice;
    let _is_initialized = sc_0.loadBit();
    let _index = sc_0.loadUintBig(256);
    let _collection_address = sc_0.loadAddress();
    let _owner = sc_0.loadAddress();
    let _content = sc_0.loadRef();
    return {
        $$type: 'NftItemData' as const,
        is_initialized: _is_initialized,
        index: _index,
        collection_address: _collection_address,
        owner: _owner,
        content: _content,
    };
}

function loadTupleNftItemData(source: TupleReader) {
    let _is_initialized = source.readBoolean();
    let _index = source.readBigNumber();
    let _collection_address = source.readAddress();
    let _owner = source.readAddress();
    let _content = source.readCell();
    return {
        $$type: 'NftItemData' as const,
        is_initialized: _is_initialized,
        index: _index,
        collection_address: _collection_address,
        owner: _owner,
        content: _content,
    };
}

function storeTupleNftItemData(source: NftItemData) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.is_initialized);
    builder.writeNumber(source.index);
    builder.writeAddress(source.collection_address);
    builder.writeAddress(source.owner);
    builder.writeCell(source.content);
    return builder.build();
}

function dictValueParserNftItemData(): DictionaryValue<NftItemData> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeNftItemData(src)).endCell());
        },
        parse: (src) => {
            return loadNftItemData(src.loadRef().beginParse());
        },
    };
}

export type AuctionSaleData = {
    $$type: 'AuctionSaleData';
    op_code: bigint;
    end: boolean;
    end_time: bigint;
    mp_addr: Address;
    nft_addr: Address;
    nft_owner: Address;
    last_bid: bigint;
    last_member: Address;
    min_step: bigint;
    mp_fee_addr: Address;
    mp_fee_factor: bigint;
    mp_fee_base: bigint;
    royalty_fee_addr: Address;
    royalty_fee_factor: bigint;
    royalty_fee_base: bigint;
    max_bid: bigint;
    min_bid: bigint;
    created_at: bigint;
    last_bid_at: bigint;
    is_canceled: boolean;
};

export function storeAuctionSaleData(src: AuctionSaleData) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(src.op_code, 32);
        b_0.storeBit(src.end);
        b_0.storeUint(src.end_time, 32);
        b_0.storeAddress(src.mp_addr);
        b_0.storeAddress(src.nft_addr);
        b_0.storeAddress(src.nft_owner);
        b_0.storeCoins(src.last_bid);
        let b_1 = new Builder();
        b_1.storeAddress(src.last_member);
        b_1.storeUint(src.min_step, 8);
        b_1.storeAddress(src.mp_fee_addr);
        b_1.storeUint(src.mp_fee_factor, 32);
        b_1.storeUint(src.mp_fee_base, 32);
        b_1.storeAddress(src.royalty_fee_addr);
        b_1.storeUint(src.royalty_fee_factor, 32);
        b_1.storeUint(src.royalty_fee_base, 32);
        let b_2 = new Builder();
        b_2.storeCoins(src.max_bid);
        b_2.storeCoins(src.min_bid);
        b_2.storeUint(src.created_at, 32);
        b_2.storeUint(src.last_bid_at, 32);
        b_2.storeBit(src.is_canceled);
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadAuctionSaleData(slice: Slice) {
    let sc_0 = slice;
    let _op_code = sc_0.loadUintBig(32);
    let _end = sc_0.loadBit();
    let _end_time = sc_0.loadUintBig(32);
    let _mp_addr = sc_0.loadAddress();
    let _nft_addr = sc_0.loadAddress();
    let _nft_owner = sc_0.loadAddress();
    let _last_bid = sc_0.loadCoins();
    let sc_1 = sc_0.loadRef().beginParse();
    let _last_member = sc_1.loadAddress();
    let _min_step = sc_1.loadUintBig(8);
    let _mp_fee_addr = sc_1.loadAddress();
    let _mp_fee_factor = sc_1.loadUintBig(32);
    let _mp_fee_base = sc_1.loadUintBig(32);
    let _royalty_fee_addr = sc_1.loadAddress();
    let _royalty_fee_factor = sc_1.loadUintBig(32);
    let _royalty_fee_base = sc_1.loadUintBig(32);
    let sc_2 = sc_1.loadRef().beginParse();
    let _max_bid = sc_2.loadCoins();
    let _min_bid = sc_2.loadCoins();
    let _created_at = sc_2.loadUintBig(32);
    let _last_bid_at = sc_2.loadUintBig(32);
    let _is_canceled = sc_2.loadBit();
    return {
        $$type: 'AuctionSaleData' as const,
        op_code: _op_code,
        end: _end,
        end_time: _end_time,
        mp_addr: _mp_addr,
        nft_addr: _nft_addr,
        nft_owner: _nft_owner,
        last_bid: _last_bid,
        last_member: _last_member,
        min_step: _min_step,
        mp_fee_addr: _mp_fee_addr,
        mp_fee_factor: _mp_fee_factor,
        mp_fee_base: _mp_fee_base,
        royalty_fee_addr: _royalty_fee_addr,
        royalty_fee_factor: _royalty_fee_factor,
        royalty_fee_base: _royalty_fee_base,
        max_bid: _max_bid,
        min_bid: _min_bid,
        created_at: _created_at,
        last_bid_at: _last_bid_at,
        is_canceled: _is_canceled,
    };
}

function loadTupleAuctionSaleData(source: TupleReader) {
    let _op_code = source.readBigNumber();
    let _end = source.readBoolean();
    let _end_time = source.readBigNumber();
    let _mp_addr = source.readAddress();
    let _nft_addr = source.readAddress();
    let _nft_owner = source.readAddress();
    let _last_bid = source.readBigNumber();
    let _last_member = source.readAddress();
    let _min_step = source.readBigNumber();
    let _mp_fee_addr = source.readAddress();
    let _mp_fee_factor = source.readBigNumber();
    let _mp_fee_base = source.readBigNumber();
    let _royalty_fee_addr = source.readAddress();
    let _royalty_fee_factor = source.readBigNumber();
    let _royalty_fee_base = source.readBigNumber();
    let _max_bid = source.readBigNumber();
    let _min_bid = source.readBigNumber();
    let _created_at = source.readBigNumber();
    let _last_bid_at = source.readBigNumber();
    let _is_canceled = source.readBoolean();
    return {
        $$type: 'AuctionSaleData' as const,
        op_code: _op_code,
        end: _end,
        end_time: _end_time,
        mp_addr: _mp_addr,
        nft_addr: _nft_addr,
        nft_owner: _nft_owner,
        last_bid: _last_bid,
        last_member: _last_member,
        min_step: _min_step,
        mp_fee_addr: _mp_fee_addr,
        mp_fee_factor: _mp_fee_factor,
        mp_fee_base: _mp_fee_base,
        royalty_fee_addr: _royalty_fee_addr,
        royalty_fee_factor: _royalty_fee_factor,
        royalty_fee_base: _royalty_fee_base,
        max_bid: _max_bid,
        min_bid: _min_bid,
        created_at: _created_at,
        last_bid_at: _last_bid_at,
        is_canceled: _is_canceled,
    };
}

function storeTupleAuctionSaleData(source: AuctionSaleData) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.op_code);
    builder.writeBoolean(source.end);
    builder.writeNumber(source.end_time);
    builder.writeAddress(source.mp_addr);
    builder.writeAddress(source.nft_addr);
    builder.writeAddress(source.nft_owner);
    builder.writeNumber(source.last_bid);
    builder.writeAddress(source.last_member);
    builder.writeNumber(source.min_step);
    builder.writeAddress(source.mp_fee_addr);
    builder.writeNumber(source.mp_fee_factor);
    builder.writeNumber(source.mp_fee_base);
    builder.writeAddress(source.royalty_fee_addr);
    builder.writeNumber(source.royalty_fee_factor);
    builder.writeNumber(source.royalty_fee_base);
    builder.writeNumber(source.max_bid);
    builder.writeNumber(source.min_bid);
    builder.writeNumber(source.created_at);
    builder.writeNumber(source.last_bid_at);
    builder.writeBoolean(source.is_canceled);
    return builder.build();
}

function dictValueParserAuctionSaleData(): DictionaryValue<AuctionSaleData> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeAuctionSaleData(src)).endCell());
        },
        parse: (src) => {
            return loadAuctionSaleData(src.loadRef().beginParse());
        },
    };
}

export type AuctionData = {
    $$type: 'AuctionData';
    activated: boolean;
    end: boolean;
    end_time: bigint;
    mp_addr: Address;
    nft_addr: Address;
    nft_owner: Address;
    last_bid: bigint;
    last_member: Address;
    min_step: bigint;
    mp_fee_addr: Address;
    mp_fee_factor: bigint;
    mp_fee_base: bigint;
    royalty_fee_addr: Address;
    royalty_fee_factor: bigint;
    royalty_fee_base: bigint;
    max_bid: bigint;
    min_bid: bigint;
    created_at: bigint;
    last_bid_at: bigint;
    is_canceled: boolean;
    step_time: bigint;
    last_query_id: bigint;
};

export function storeAuctionData(src: AuctionData) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.activated);
        b_0.storeBit(src.end);
        b_0.storeUint(src.end_time, 32);
        b_0.storeAddress(src.mp_addr);
        b_0.storeAddress(src.nft_addr);
        b_0.storeAddress(src.nft_owner);
        b_0.storeCoins(src.last_bid);
        let b_1 = new Builder();
        b_1.storeAddress(src.last_member);
        b_1.storeUint(src.min_step, 8);
        b_1.storeAddress(src.mp_fee_addr);
        b_1.storeUint(src.mp_fee_factor, 32);
        b_1.storeUint(src.mp_fee_base, 32);
        b_1.storeAddress(src.royalty_fee_addr);
        b_1.storeUint(src.royalty_fee_factor, 32);
        b_1.storeUint(src.royalty_fee_base, 32);
        let b_2 = new Builder();
        b_2.storeCoins(src.max_bid);
        b_2.storeCoins(src.min_bid);
        b_2.storeUint(src.created_at, 32);
        b_2.storeUint(src.last_bid_at, 32);
        b_2.storeBit(src.is_canceled);
        b_2.storeUint(src.step_time, 16);
        b_2.storeUint(src.last_query_id, 64);
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadAuctionData(slice: Slice) {
    let sc_0 = slice;
    let _activated = sc_0.loadBit();
    let _end = sc_0.loadBit();
    let _end_time = sc_0.loadUintBig(32);
    let _mp_addr = sc_0.loadAddress();
    let _nft_addr = sc_0.loadAddress();
    let _nft_owner = sc_0.loadAddress();
    let _last_bid = sc_0.loadCoins();
    let sc_1 = sc_0.loadRef().beginParse();
    let _last_member = sc_1.loadAddress();
    let _min_step = sc_1.loadUintBig(8);
    let _mp_fee_addr = sc_1.loadAddress();
    let _mp_fee_factor = sc_1.loadUintBig(32);
    let _mp_fee_base = sc_1.loadUintBig(32);
    let _royalty_fee_addr = sc_1.loadAddress();
    let _royalty_fee_factor = sc_1.loadUintBig(32);
    let _royalty_fee_base = sc_1.loadUintBig(32);
    let sc_2 = sc_1.loadRef().beginParse();
    let _max_bid = sc_2.loadCoins();
    let _min_bid = sc_2.loadCoins();
    let _created_at = sc_2.loadUintBig(32);
    let _last_bid_at = sc_2.loadUintBig(32);
    let _is_canceled = sc_2.loadBit();
    let _step_time = sc_2.loadUintBig(16);
    let _last_query_id = sc_2.loadUintBig(64);
    return {
        $$type: 'AuctionData' as const,
        activated: _activated,
        end: _end,
        end_time: _end_time,
        mp_addr: _mp_addr,
        nft_addr: _nft_addr,
        nft_owner: _nft_owner,
        last_bid: _last_bid,
        last_member: _last_member,
        min_step: _min_step,
        mp_fee_addr: _mp_fee_addr,
        mp_fee_factor: _mp_fee_factor,
        mp_fee_base: _mp_fee_base,
        royalty_fee_addr: _royalty_fee_addr,
        royalty_fee_factor: _royalty_fee_factor,
        royalty_fee_base: _royalty_fee_base,
        max_bid: _max_bid,
        min_bid: _min_bid,
        created_at: _created_at,
        last_bid_at: _last_bid_at,
        is_canceled: _is_canceled,
        step_time: _step_time,
        last_query_id: _last_query_id,
    };
}

function loadTupleAuctionData(source: TupleReader) {
    let _activated = source.readBoolean();
    let _end = source.readBoolean();
    let _end_time = source.readBigNumber();
    let _mp_addr = source.readAddress();
    let _nft_addr = source.readAddress();
    let _nft_owner = source.readAddress();
    let _last_bid = source.readBigNumber();
    let _last_member = source.readAddress();
    let _min_step = source.readBigNumber();
    let _mp_fee_addr = source.readAddress();
    let _mp_fee_factor = source.readBigNumber();
    let _mp_fee_base = source.readBigNumber();
    let _royalty_fee_addr = source.readAddress();
    let _royalty_fee_factor = source.readBigNumber();
    let _royalty_fee_base = source.readBigNumber();
    let _max_bid = source.readBigNumber();
    let _min_bid = source.readBigNumber();
    let _created_at = source.readBigNumber();
    let _last_bid_at = source.readBigNumber();
    let _is_canceled = source.readBoolean();
    let _step_time = source.readBigNumber();
    let _last_query_id = source.readBigNumber();
    return {
        $$type: 'AuctionData' as const,
        activated: _activated,
        end: _end,
        end_time: _end_time,
        mp_addr: _mp_addr,
        nft_addr: _nft_addr,
        nft_owner: _nft_owner,
        last_bid: _last_bid,
        last_member: _last_member,
        min_step: _min_step,
        mp_fee_addr: _mp_fee_addr,
        mp_fee_factor: _mp_fee_factor,
        mp_fee_base: _mp_fee_base,
        royalty_fee_addr: _royalty_fee_addr,
        royalty_fee_factor: _royalty_fee_factor,
        royalty_fee_base: _royalty_fee_base,
        max_bid: _max_bid,
        min_bid: _min_bid,
        created_at: _created_at,
        last_bid_at: _last_bid_at,
        is_canceled: _is_canceled,
        step_time: _step_time,
        last_query_id: _last_query_id,
    };
}

function storeTupleAuctionData(source: AuctionData) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.activated);
    builder.writeBoolean(source.end);
    builder.writeNumber(source.end_time);
    builder.writeAddress(source.mp_addr);
    builder.writeAddress(source.nft_addr);
    builder.writeAddress(source.nft_owner);
    builder.writeNumber(source.last_bid);
    builder.writeAddress(source.last_member);
    builder.writeNumber(source.min_step);
    builder.writeAddress(source.mp_fee_addr);
    builder.writeNumber(source.mp_fee_factor);
    builder.writeNumber(source.mp_fee_base);
    builder.writeAddress(source.royalty_fee_addr);
    builder.writeNumber(source.royalty_fee_factor);
    builder.writeNumber(source.royalty_fee_base);
    builder.writeNumber(source.max_bid);
    builder.writeNumber(source.min_bid);
    builder.writeNumber(source.created_at);
    builder.writeNumber(source.last_bid_at);
    builder.writeBoolean(source.is_canceled);
    builder.writeNumber(source.step_time);
    builder.writeNumber(source.last_query_id);
    return builder.build();
}

function dictValueParserAuctionData(): DictionaryValue<AuctionData> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeAuctionData(src)).endCell());
        },
        parse: (src) => {
            return loadAuctionData(src.loadRef().beginParse());
        },
    };
}

export type SaleData = {
    $$type: 'SaleData';
    op_code: bigint;
    is_complete: boolean;
    created_at: bigint;
    mp_addr: Address;
    nft_addr: Address;
    nft_owner: Address;
    full_price: bigint;
    mp_fee_addr: Address;
    mp_fee: bigint;
    royalty_fee_addr: Address;
    royalty_fee: bigint;
};

export function storeSaleData(src: SaleData) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(src.op_code, 32);
        b_0.storeBit(src.is_complete);
        b_0.storeUint(src.created_at, 32);
        b_0.storeAddress(src.mp_addr);
        b_0.storeAddress(src.nft_addr);
        b_0.storeAddress(src.nft_owner);
        b_0.storeCoins(src.full_price);
        let b_1 = new Builder();
        b_1.storeAddress(src.mp_fee_addr);
        b_1.storeCoins(src.mp_fee);
        b_1.storeAddress(src.royalty_fee_addr);
        b_1.storeCoins(src.royalty_fee);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadSaleData(slice: Slice) {
    let sc_0 = slice;
    let _op_code = sc_0.loadUintBig(32);
    let _is_complete = sc_0.loadBit();
    let _created_at = sc_0.loadUintBig(32);
    let _mp_addr = sc_0.loadAddress();
    let _nft_addr = sc_0.loadAddress();
    let _nft_owner = sc_0.loadAddress();
    let _full_price = sc_0.loadCoins();
    let sc_1 = sc_0.loadRef().beginParse();
    let _mp_fee_addr = sc_1.loadAddress();
    let _mp_fee = sc_1.loadCoins();
    let _royalty_fee_addr = sc_1.loadAddress();
    let _royalty_fee = sc_1.loadCoins();
    return {
        $$type: 'SaleData' as const,
        op_code: _op_code,
        is_complete: _is_complete,
        created_at: _created_at,
        mp_addr: _mp_addr,
        nft_addr: _nft_addr,
        nft_owner: _nft_owner,
        full_price: _full_price,
        mp_fee_addr: _mp_fee_addr,
        mp_fee: _mp_fee,
        royalty_fee_addr: _royalty_fee_addr,
        royalty_fee: _royalty_fee,
    };
}

function loadTupleSaleData(source: TupleReader) {
    let _op_code = source.readBigNumber();
    let _is_complete = source.readBoolean();
    let _created_at = source.readBigNumber();
    let _mp_addr = source.readAddress();
    let _nft_addr = source.readAddress();
    let _nft_owner = source.readAddress();
    let _full_price = source.readBigNumber();
    let _mp_fee_addr = source.readAddress();
    let _mp_fee = source.readBigNumber();
    let _royalty_fee_addr = source.readAddress();
    let _royalty_fee = source.readBigNumber();
    return {
        $$type: 'SaleData' as const,
        op_code: _op_code,
        is_complete: _is_complete,
        created_at: _created_at,
        mp_addr: _mp_addr,
        nft_addr: _nft_addr,
        nft_owner: _nft_owner,
        full_price: _full_price,
        mp_fee_addr: _mp_fee_addr,
        mp_fee: _mp_fee,
        royalty_fee_addr: _royalty_fee_addr,
        royalty_fee: _royalty_fee,
    };
}

function storeTupleSaleData(source: SaleData) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.op_code);
    builder.writeBoolean(source.is_complete);
    builder.writeNumber(source.created_at);
    builder.writeAddress(source.mp_addr);
    builder.writeAddress(source.nft_addr);
    builder.writeAddress(source.nft_owner);
    builder.writeNumber(source.full_price);
    builder.writeAddress(source.mp_fee_addr);
    builder.writeNumber(source.mp_fee);
    builder.writeAddress(source.royalty_fee_addr);
    builder.writeNumber(source.royalty_fee);
    return builder.build();
}

function dictValueParserSaleData(): DictionaryValue<SaleData> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeSaleData(src)).endCell());
        },
        parse: (src) => {
            return loadSaleData(src.loadRef().beginParse());
        },
    };
}

export type FixPriceData = {
    $$type: 'FixPriceData';
    is_complete: boolean;
    created_at: bigint;
    mp_addr: Address;
    nft_addr: Address;
    nft_owner: Address;
    full_price: bigint;
    mp_fee_addr: Address;
    mp_fee: bigint;
    royalty_fee_addr: Address;
    royalty_fee: bigint;
    sold_at: bigint;
    last_query_id: bigint;
};

export function storeFixPriceData(src: FixPriceData) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.is_complete);
        b_0.storeUint(src.created_at, 32);
        b_0.storeAddress(src.mp_addr);
        b_0.storeAddress(src.nft_addr);
        b_0.storeAddress(src.nft_owner);
        b_0.storeCoins(src.full_price);
        let b_1 = new Builder();
        b_1.storeAddress(src.mp_fee_addr);
        b_1.storeCoins(src.mp_fee);
        b_1.storeAddress(src.royalty_fee_addr);
        b_1.storeCoins(src.royalty_fee);
        b_1.storeUint(src.sold_at, 32);
        b_1.storeUint(src.last_query_id, 64);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadFixPriceData(slice: Slice) {
    let sc_0 = slice;
    let _is_complete = sc_0.loadBit();
    let _created_at = sc_0.loadUintBig(32);
    let _mp_addr = sc_0.loadAddress();
    let _nft_addr = sc_0.loadAddress();
    let _nft_owner = sc_0.loadAddress();
    let _full_price = sc_0.loadCoins();
    let sc_1 = sc_0.loadRef().beginParse();
    let _mp_fee_addr = sc_1.loadAddress();
    let _mp_fee = sc_1.loadCoins();
    let _royalty_fee_addr = sc_1.loadAddress();
    let _royalty_fee = sc_1.loadCoins();
    let _sold_at = sc_1.loadUintBig(32);
    let _last_query_id = sc_1.loadUintBig(64);
    return {
        $$type: 'FixPriceData' as const,
        is_complete: _is_complete,
        created_at: _created_at,
        mp_addr: _mp_addr,
        nft_addr: _nft_addr,
        nft_owner: _nft_owner,
        full_price: _full_price,
        mp_fee_addr: _mp_fee_addr,
        mp_fee: _mp_fee,
        royalty_fee_addr: _royalty_fee_addr,
        royalty_fee: _royalty_fee,
        sold_at: _sold_at,
        last_query_id: _last_query_id,
    };
}

function loadTupleFixPriceData(source: TupleReader) {
    let _is_complete = source.readBoolean();
    let _created_at = source.readBigNumber();
    let _mp_addr = source.readAddress();
    let _nft_addr = source.readAddress();
    let _nft_owner = source.readAddress();
    let _full_price = source.readBigNumber();
    let _mp_fee_addr = source.readAddress();
    let _mp_fee = source.readBigNumber();
    let _royalty_fee_addr = source.readAddress();
    let _royalty_fee = source.readBigNumber();
    let _sold_at = source.readBigNumber();
    let _last_query_id = source.readBigNumber();
    return {
        $$type: 'FixPriceData' as const,
        is_complete: _is_complete,
        created_at: _created_at,
        mp_addr: _mp_addr,
        nft_addr: _nft_addr,
        nft_owner: _nft_owner,
        full_price: _full_price,
        mp_fee_addr: _mp_fee_addr,
        mp_fee: _mp_fee,
        royalty_fee_addr: _royalty_fee_addr,
        royalty_fee: _royalty_fee,
        sold_at: _sold_at,
        last_query_id: _last_query_id,
    };
}

function storeTupleFixPriceData(source: FixPriceData) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.is_complete);
    builder.writeNumber(source.created_at);
    builder.writeAddress(source.mp_addr);
    builder.writeAddress(source.nft_addr);
    builder.writeAddress(source.nft_owner);
    builder.writeNumber(source.full_price);
    builder.writeAddress(source.mp_fee_addr);
    builder.writeNumber(source.mp_fee);
    builder.writeAddress(source.royalty_fee_addr);
    builder.writeNumber(source.royalty_fee);
    builder.writeNumber(source.sold_at);
    builder.writeNumber(source.last_query_id);
    return builder.build();
}

function dictValueParserFixPriceData(): DictionaryValue<FixPriceData> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeFixPriceData(src)).endCell());
        },
        parse: (src) => {
            return loadFixPriceData(src.loadRef().beginParse());
        },
    };
}

type AuctionContract_init_args = {
    $$type: 'AuctionContract_init_args';
    mp_addr: Address;
    nft_addr: Address;
    created_at: bigint;
    body: Cell;
};

function initAuctionContract_init_args(src: AuctionContract_init_args) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeAddress(src.mp_addr);
        b_0.storeAddress(src.nft_addr);
        b_0.storeInt(src.created_at, 257);
        b_0.storeRef(src.body);
    };
}

async function AuctionContract_init(
    mp_addr: Address,
    nft_addr: Address,
    created_at: bigint,
    body: Cell
) {
    const __code = Cell.fromBase64(
        'te6ccgECPQEAEmwAART/APSkE/S88sgLAQIBIAIDAgFIBAUDrPLbPBEWERcRFhEVERYRFREUERURFBETERQRExESERMREhERERIREREQEREREA8REA9VDts8MMj4QwHMfwHKABEXERYRFREUERMREhERERBV4Ns8ye1UJSYnA+LQAdDTAwFxsKMB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiFRQUwNvBPhhAvhi2zwRFhEYERYRFREXERURFBEWERQRExEVERMREhEUERIRERETEREREBESERAPEREPDhEQDhDfVRzbPPLggiUGBwIBIBYXA/QBkjB/4HAh10nCH5UwINcLH94gwAAi10nBIbCcW/hCVhMBxwXy4ZV/4CCCEAUTjZG6jrQw0x8BghAFE42RuvLggdM/+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiFQSAmwT4CCCEBkz+6O64wIgghBWxuO/uggJCgFAyPhDAcx/AcoAERcRFhEVERQRExESEREREFXg2zzJ7VQnALgwMVcVVhXAAPLh9VYWwACOM3AgyHIBywFwAcsAEsoHy//J0CDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgBERHHBZNXEHDi8uH3+EJWEQHHBfLhlX8RFBEQfwEkMNMfAYIQGTP7o7ry4IHTPwExCwJwjpUw0x8BghBWxuO/uvLggdM/ATHbPH/gghAuVIamuo6U0x8BghAuVIamuvLggdM/ATHbPH/gMHAMDQLe+EFvJDAy+CMlufLh+FYYwADy4fVWF8D/8uH2AYIQBfXhAL7y4fkmwADy4fpWEiHHBZF/lVYUIccF4vLhlQGBAIJtcMjJ0FYWBAZVIBA1XjFwUFZwBshVUNs8yVYVREQUQzBtbds8VxN/VxV/ERN/ODkBcjD4QW8kMDJWF8AA8uH1VhbA//Lh9gGCEAX14QC+8uH5+CMjvvLh+1YRIccFkX+VVhMhxwXi8uGVcA4C9lYVwP/y4fZWFsAAkX+U+CMjueLy4fURFhEXERYRFREXERURFBEXERQRExEXERMREhEXERIREREXEREREBEXERAPERcPDhEXDg0RFw0MERcMCxEXCwoRFwoJERcJERcIBwZVQNs88uH8IfgjoYIIGl4Au/Lh/fhBbyQwMh4PA5gmwACPRY4Q+CdvEIIQHc1lAL7y4fn4AN74I4EAgm1wyMnQVhYEBlUgEDVeMXBQVnAGyFVQ2zzJVhVERBRDMG1t2zxXE39XFX8RE+MOODkwAt4pghAF9eEAoFIgvpMpwgCRcOKO2V2h+CO5lFEyoAPeJsAAmmxEUxa+8uH5+CPjDhEVERYRFREUERURFBETERQRExESERMREhERERIREREQEREREA8REA8Q7xDeEM0QvBCrEJoQiRB4EGcVRGMS4w0QEQLiERYRGBEWERURFxEVERQRGBEUERMRFxETERIRGBESERERFxERERARGBEQDxEXDw4RGA4NERcNDBEYDAsRFwsKERgKCREXCQgRGAgHERcHBhEYBgURFwUEERgEAxEXAwIRGAIBERcBERjbPFYYAb7y4fkfEgGcMREWERcRFhEVERcRFREUERcRFBETERcRExESERcREhERERcREREQERcREA8RFw8OERcODREXDQwRFwwLERcLChEXCgkRFwkRFwgHBlVAEwLOJMIAj0EkgghVGSih+CdvEIIImJaAoVIQvJsw+CdvEIIImJaAod4gwgCPGHKIKFAzIcIAjooScAEUQzBtbds8kl8E4pEw4t5sQhESERQREhERERMREREQERIREA8REQ8OERAOVR34IxQ5A/wkwgCPQSSCCFUZKKH4J28QggiYloChUhC8mzD4J28QggiYloCh3iDCAI8YcogoUDMhwgCOihJwARRDMG1t2zySXwTikTDi3mxCVhMkERQRFhEUERMRFRETERIRFBESERERExERERAREhEQDxERDw4REA4Q3xDOEL0QrBCbEIoUORUAOAAAAABZb3VyIGJpZCBoYXMgYmVlbiBvdXRiaWQDtBB5EGgQVxBGFfgjVTFwJsAAj0WOEPgnbxCCEB3NZQC+8uH5+ADe+COBAIJtcMjJ0FYWBAZVIBA1XjFwUFZwBshVUNs8yVYVREQUQzBtbds8VxN/VxV/ERPjDjg5MAKZvOFm2ebZ4riiuKK4oriiuKK4oriiuKK4oriiuKK4oriiuKK4oriiuKK4oriiuKK4oriiuKCIgIiYiIB4iJB4cIiIcGiIgGiGeIXyqVQlGAIBIBkaAVjbPPLh/IIIQVVDVhYjVhVWFVYVVHq8VhdWF1YXVhdWF1YXVhZWGFYgVhVWJh4CAVgbHAIBSCMkAqWylHbPNs8VxZXFlcWVxZXFlcWVxZXFlcWVxZXFlcWVxZXFlcWVxZXFlcWVxZXFlcWVxdXFRETERQRExESERMREhERERIREREQEREREA8REA9VDoCUdALmy9GCcFzsPV0srnsehOw51kqFG2aCcJ3WNS0rZHyzItOvLf3xYjmCcCBVwBuAZ2OUzlg6rkclssOCcBvUne+VRZbxx1PT3gVZwyaCcJ2XTlqzTstzOg6WbZRm6KSACbNs88uH8JMIAjoPbPDDeVhRWFiNWFVYVVhVUerxWF1YXVhdWF1YXVhdWFlYYViBWFVYmVhRWFx4fAfIRFREWERURFBEWERQRExEWERMREhEWERIREREWEREREBEWERAPERYPDhEWDg0RFg2CEDuaygBWF1HgDg0MCwoJCAcGBQRDE1ICAREaASDAAJNfA3CVWagBqQTiERYRFxEWERURFxEVERQRFxEUERMRFxETERIRFxESIAH2VhZWFlYWVhZWFlYWVhZWFlYWVhZWFlYWVhZWFlYWVhZWFlYWVhZWFlYWVhZWFlYbghAF9eEAoFYepmQRFxEvERcRFhEuERYRFREtERURFBEsERQRExErERMREhEqERIREREpEREREBEoERAPEScPDhEmDg0RJQ0MESQMIgH6ERERFxERERARFxEQDxEXDw4RFw4NERcNDBEXDAsRFwtWF1GwCwoJCAcGBQRDE1YaAgERGgEgwACTXwNwlVmoAakE4gERGQERGKEBERehwQGOKREUERYRFBETERURExESERQREhERERMREREQERIREA8REQ8OERAOVR1/4w0hAFIRFBEWERQRExEVERMREhEUERIRERETEREREBESERAPEREPDhEQDlUdcADqCxEjCwoRIgoJESEJCBEgCAcRHwcGER4GVh0GBREdBQQRHAQDERsDAhEaAhEeAYBkIMAAk18DcJVZqAGpBOJXEF8PbHEStgkBERcBAREWAQERFQEBERQBARETAQEREgEBEREBAREQAR8eHRwbGhkYFxYVFEMwABGwr7tRNDSAAGAAdbJu40NWlwZnM6Ly9RbVd3VXRoZXM0Zm9EbmdaWGhtWmh5Q1JoVmNGNGhzOUs2Qnd3b3hOVmc4SzE4ggAoztRNDUAfhj0gABjq7bPFcXERURFhEVERQRFREUERMRFBETERIRExESEREREhERERAREREQDxEQD1UO4Pgo1wsKgwm68uCJKCkBgO2i7ftwIddJwh+VMCDXCx/ewACOp/kBgvAhq4kW9pSEbvMoSt+6r7i6Mhe0y4hglv+ufZxmqLgeobrjApEw4nAvAfYBERYBERfKAAERFAHKAAEREgHKAAEREAHKAFAOINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WUAwg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxZQCiDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFhg7AdrSANIA0gDSAPpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAH6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAdMf1AHQKgGc+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAH6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAYEBAdcA1FUwBNFVAts8LAH4+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAHTH9Mf+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAHTH9Mf+gD6ANMH1DDQ+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAH6ANMf0z/TH9MPMCsAQA8RFw8PERYPDxEVDw8RFA8PERMPDxESDw8REQ8PERAPAbxwcHBwcFRwACDIcgHLAXABywASygfL/8nQINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAjQ1AHQ+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAHTH9MfLQH++kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAHTH9Mf0QbUAdD6APoA0wfTH9MPU93IcgHLAXABywASygfL/8nQINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAHRBtEREhEWERIREREVEREREBEUERAPERMPDxEQDy4AJBCuEJ0QjBB7XjYQSBA3ECYQJAPOVhXAAPLh9VYUwP/y4fb4IyK+8uH7VhB/JsAAj0WOEPgnbxCCEB3NZQC+8uH5+ADe+COBAIJtcMjJ0FYWBAZVIBA1XjFwUFZwBshVUNs8yVYVREQUQzBtbds8VxN/VxV/ERPjDn/bMTg5MAH6ERYRGBEWERURFxEVERQRGBEUERMRFxETERIRGBESERERFxERERARGBEQDxEXDw4RGA5WFw5WGQ4MClDYGxlUJwdGFUFDAREaAREbIMAAk18DcJVZqAGpBOIRFhEXERYRFREXERURFBEXERQRExEXERMREhEXERIREREXERExBPYREBEXERAPERcPDhEXDg0RFw0MERcMCxEXC1YXUbALCgkIUXAHBgUEAxEaWCDAAJNfA3CVWagBqQTiJVYZoSGhERuOGVYaghAdzWUAvvLh+REaghAdzWUAofgAERrecohWEQMRGwEhwgCOihJwARRDMG1t2zySXwTicogyOTM0ACYAAAAATWFya2V0cGxhY2UgZmVlAB4AAAAAUm95YWx0eSBmZWUD+BEYERkRGBEXERgRFxEWERcRFhEVERYRFREUERURFBETERQRExESERMREhERERIREREQEREREA8REA8Q7y0PEN4QzRC8EKsQmhCJEHgQZxBWEEUQNAEhwgCOihJwARRDMG1t2zySXwTicogRGBEZERgRFxEYERcRFhEXERY5NTYAJAAAAABBdWN0aW9uIHByb2ZpdAL4ERURFhEVERQRFREUERMRFBETVhIRFBESERMREhERERIREREQEREREA8REA8Q7xDeEM0QvBCrEJoQiRB4EGcQVhBFEDQRGwEhwgCOihJwARRDMG1t2zySXwTigQCC+CNtccjJ0BEbERwRGxEaERsRGhEZERoRGREYERkRGDk3AtwRFxEYERcRFhEXERYRFREWERURFBEVERQRExEUERMREhETERIRERESEREREBERERAPERAPEO8qEO8Q3gwNEKsQmhCJEHgQZxBWEEVVIBA1XjFwUFZwBshVUNs8yVYVREQUQzBtbds8MX9XFfgjATg5AMKCEF/MPRRQB8sfFcs/UAMg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxYBINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WIW6zlX8BygDMlHAyygDiAfoCAc8WAcrIcQHKAVAHAcoAcAHKAlAFINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WUAP6AnABymgjbrORf5MkbrPilzMzAXABygDjDSFus5x/AcoAASBu8tCAAcyVMXABygDiyQH7ADoAmH8BygDIcAHKAHABygAkbrOdfwHKAAQgbvLQgFAEzJY0A3ABygDiJG6znX8BygAEIG7y0IBQBMyWNANwAcoA4nABygACfwHKAALJWMwB/MsfyFAHINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WFcsfE8sfASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFssfyx9Y+gJY+gISywfIUAMg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxZQA/oCE8sfEzwAHMs/E8sfE8sPyQHMyQHM'
    );
    const __system = Cell.fromBase64(
        'te6cckECPwEAEnYAAQHAAQEFoNwlAgEU/wD0pBP0vPLICwMCASAEJgIBSAUWA+LQAdDTAwFxsKMB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiFRQUwNvBPhhAvhi2zwRFhEYERYRFREXERURFBEWERQRExEVERMREhEUERIRERETEREREBESERAPEREPDhEQDhDfVRzbPPLggicGFQP0AZIwf+BwIddJwh+VMCDXCx/eIMAAItdJwSGwnFv4QlYTAccF8uGVf+AgghAFE42Ruo60MNMfAYIQBRONkbry4IHTP/pAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IhUEgJsE+AgghAZM/ujuuMCIIIQVsbjv7oHCAoAuDAxVxVWFcAA8uH1VhbAAI4zcCDIcgHLAXABywASygfL/8nQINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAEREccFk1cQcOLy4ff4QlYRAccF8uGVfxEUERB/ASQw0x8BghAZM/ujuvLggdM/ATEJAt74QW8kMDL4IyW58uH4VhjAAPLh9VYXwP/y4fYBghAF9eEAvvLh+SbAAPLh+lYSIccFkX+VVhQhxwXi8uGVAYEAgm1wyMnQVhYEBlUgEDVeMXBQVnAGyFVQ2zzJVhVERBRDMG1t2zxXE39XFX8RE385OgJwjpUw0x8BghBWxuO/uvLggdM/ATHbPH/gghAuVIamuo6U0x8BghAuVIamuvLggdM/ATHbPH/gMHALDQFyMPhBbyQwMlYXwADy4fVWFsD/8uH2AYIQBfXhAL7y4fn4IyO+8uH7VhEhxwWRf5VWEyHHBeLy4ZVwDAOYJsAAj0WOEPgnbxCCEB3NZQC+8uH5+ADe+COBAIJtcMjJ0FYWBAZVIBA1XjFwUFZwBshVUNs8yVYVREQUQzBtbds8VxN/VxV/ERPjDjk6MQL2VhXA//Lh9lYWwACRf5T4IyO54vLh9REWERcRFhEVERcRFREUERcRFBETERcRExESERcREhERERcREREQERcREA8RFw8OERcODREXDQwRFwwLERcLChEXCgkRFwkRFwgHBlVA2zzy4fwh+COhgggaXgC78uH9+EFvJDAyHQ4C3imCEAX14QCgUiC+kynCAJFw4o7ZXaH4I7mUUTKgA94mwACabERTFr7y4fn4I+MOERURFhEVERQRFREUERMRFBETERIRExESEREREhERERAREREQDxEQDxDvEN4QzRC8EKsQmhCJEHgQZxVEYxLjDQ8RAuIRFhEYERYRFREXERURFBEYERQRExEXERMREhEYERIREREXEREREBEYERAPERcPDhEYDg0RFw0MERgMCxEXCwoRGAoJERcJCBEYCAcRFwcGERgGBREXBQQRGAQDERcDAhEYAgERFwERGNs8VhgBvvLh+SAQAs4kwgCPQSSCCFUZKKH4J28QggiYloChUhC8mzD4J28QggiYloCh3iDCAI8YcogoUDMhwgCOihJwARRDMG1t2zySXwTikTDi3mxCERIRFBESERERExERERAREhEQDxERDw4REA5VHfgjEzoBnDERFhEXERYRFREXERURFBEXERQRExEXERMREhEXERIREREXEREREBEXERAPERcPDhEXDg0RFw0MERcMCxEXCwoRFwoJERcJERcIBwZVQBID/CTCAI9BJIIIVRkoofgnbxCCCJiWgKFSELybMPgnbxCCCJiWgKHeIMIAjxhyiChQMyHCAI6KEnABFEMwbW3bPJJfBOKRMOLebEJWEyQRFBEWERQRExEVERMREhEUERIRERETEREREBESERAPEREPDhEQDhDfEM4QvRCsEJsQihM6FAA4AAAAAFlvdXIgYmlkIGhhcyBiZWVuIG91dGJpZAO0EHkQaBBXEEYV+CNVMXAmwACPRY4Q+CdvEIIQHc1lAL7y4fn4AN74I4EAgm1wyMnQVhYEBlUgEDVeMXBQVnAGyFVQ2zzJVhVERBRDMG1t2zxXE39XFX8RE+MOOToxAUDI+EMBzH8BygARFxEWERURFBETERIREREQVeDbPMntVDwCASAXGQKZvOFm2ebZ4riiuKK4oriiuKK4oriiuKK4oriiuKK4oriiuKK4oriiuKK4oriiuKK4oriiuKCIgIiYiIB4iJB4cIiIcGiIgGiGeIXyqVQnGAFY2zzy4fyCCEFVQ1YWI1YVVhVWFVR6vFYXVhdWF1YXVhdWF1YWVhhWIFYVViYdAgEgGiMCAVgbIgKlspR2zzbPFcWVxZXFlcWVxZXFlcWVxZXFlcWVxZXFlcWVxZXFlcWVxZXFlcWVxZXFlcXVxURExEUERMREhETERIRERESEREREBERERAPERAPVQ6AnHAJs2zzy4fwkwgCOg9s8MN5WFFYWI1YVVhVWFVR6vFYXVhdWF1YXVhdWF1YWVhhWIFYVViZWFFYXHSAB8hEVERYRFREUERYRFBETERYRExESERYREhERERYREREQERYREA8RFg8OERYODREWDYIQO5rKAFYXUeAODQwLCgkIBwYFBEMTUgIBERoBIMAAk18DcJVZqAGpBOIRFhEXERYRFREXERURFBEXERQRExEXERMREhEXERIeAfoREREXEREREBEXERAPERcPDhEXDg0RFw0MERcMCxEXC1YXUbALCgkIBwYFBEMTVhoCAREaASDAAJNfA3CVWagBqQTiAREZAREYoQERF6HBAY4pERQRFhEUERMRFRETERIRFBESERERExERERAREhEQDxERDw4REA5VHX/jDR8AUhEUERYRFBETERURExESERQREhERERMREREQERIREA8REQ8OERAOVR1wAfZWFlYWVhZWFlYWVhZWFlYWVhZWFlYWVhZWFlYWVhZWFlYWVhZWFlYWVhZWFlYWVhuCEAX14QCgVh6mZBEXES8RFxEWES4RFhEVES0RFREUESwRFBETESsRExESESoREhERESkREREQESgREA8RJw8OESYODRElDQwRJAwhAOoLESMLChEiCgkRIQkIESAIBxEfBwYRHgZWHQYFER0FBBEcBAMRGwMCERoCER4BgGQgwACTXwNwlVmoAakE4lcQXw9scRK2CQERFwEBERYBAREVAQERFAEBERMBARESAQEREQEBERABHx4dHBsaGRgXFhUUQzAAubL0YJwXOw9XSyuex6E7DnWSoUbZoJwndY1LStkfLMi068t/fFiOYJwIFXAG4BnY5TOWDquRyWyw4JwG9Sd75VFlvHHU9PeBVnDJoJwnZdOWrNOy3M6DpZtlGbopIAIBSCQlABGwr7tRNDSAAGAAdbJu40NWlwZnM6Ly9RbVd3VXRoZXM0Zm9EbmdaWGhtWmh5Q1JoVmNGNGhzOUs2Qnd3b3hOVmc4SzE4ggA6zy2zwRFhEXERYRFREWERURFBEVERQRExEUERMREhETERIRERESEREREBERERAPERAPVQ7bPDDI+EMBzH8BygARFxEWERURFBETERIREREQVeDbPMntVCcvPAKM7UTQ1AH4Y9IAAY6u2zxXFxEVERYRFREUERURFBETERQRExESERMREhERERIREREQEREREA8REA9VDuD4KNcLCoMJuvLgiSgrAdrSANIA0gDSAPpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAH6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAdMf1AHQKQH4+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAHTH9Mf+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAHTH9Mf+gD6ANMH1DDQ+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAH6ANMf0z/TH9MPMCoAQA8RFw8PERYPDxEVDw8RFA8PERMPDxESDw8REQ8PERAPAZz6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgBgQEB1wDUVTAE0VUC2zwsAbxwcHBwcFRwACDIcgHLAXABywASygfL/8nQINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAjQ1AHQ+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAHTH9MfLQH++kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAHTH9Mf0QbUAdD6APoA0wfTH9MPU93IcgHLAXABywASygfL/8nQINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAHRBtEREhEWERIREREVEREREBEUERAPERMPDxEQDy4AJBCuEJ0QjBB7XjYQSBA3ECYQJAGA7aLt+3Ah10nCH5UwINcLH97AAI6n+QGC8CGriRb2lIRu8yhK37qvuLoyF7TLiGCW/659nGaouB6huuMCkTDicDADzlYVwADy4fVWFMD/8uH2+CMivvLh+1YQfybAAI9FjhD4J28QghAdzWUAvvLh+fgA3vgjgQCCbXDIydBWFgQGVSAQNV4xcFBWcAbIVVDbPMlWFUREFEMwbW3bPFcTf1cVfxET4w5/2zE5OjEB+hEWERgRFhEVERcRFREUERgRFBETERcRExESERgREhERERcREREQERgREA8RFw8OERgOVhcOVhkODApQ2BsZVCcHRhVBQwERGgERGyDAAJNfA3CVWagBqQTiERYRFxEWERURFxEVERQRFxEUERMRFxETERIRFxESERERFxERMgT2ERARFxEQDxEXDw4RFw4NERcNDBEXDAsRFwtWF1GwCwoJCFFwBwYFBAMRGlggwACTXwNwlVmoAakE4iVWGaEhoREbjhlWGoIQHc1lAL7y4fkRGoIQHc1lAKH4ABEa3nKIVhEDERsBIcIAjooScAEUQzBtbds8kl8E4nKIMzo0NQAmAAAAAE1hcmtldHBsYWNlIGZlZQAeAAAAAFJveWFsdHkgZmVlA/gRGBEZERgRFxEYERcRFhEXERYRFREWERURFBEVERQRExEUERMREhETERIRERESEREREBERERAPERAPEO8tDxDeEM0QvBCrEJoQiRB4EGcQVhBFEDQBIcIAjooScAEUQzBtbds8kl8E4nKIERgRGREYERcRGBEXERYRFxEWOjY3ACQAAAAAQXVjdGlvbiBwcm9maXQC+BEVERYRFREUERURFBETERQRE1YSERQREhETERIRERESEREREBERERAPERAPEO8Q3hDNELwQqxCaEIkQeBBnEFYQRRA0ERsBIcIAjooScAEUQzBtbds8kl8E4oEAgvgjbXHIydARGxEcERsRGhEbERoRGREaERkRGBEZERg6OALcERcRGBEXERYRFxEWERURFhEVERQRFREUERMRFBETERIRExESEREREhERERAREREQDxEQDxDvKhDvEN4MDRCrEJoQiRB4EGcQVhBFVSAQNV4xcFBWcAbIVVDbPMlWFUREFEMwbW3bPDF/VxX4IwE5OgDCghBfzD0UUAfLHxXLP1ADINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFiFus5V/AcoAzJRwMsoA4gH6AgHPFgHKyHEBygFQBwHKAHABygJQBSDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFlAD+gJwAcpoI26zkX+TJG6z4pczMwFwAcoA4w0hbrOcfwHKAAEgbvLQgAHMlTFwAcoA4skB+wA7AJh/AcoAyHABygBwAcoAJG6znX8BygAEIG7y0IBQBMyWNANwAcoA4iRus51/AcoABCBu8tCAUATMljQDcAHKAOJwAcoAAn8BygACyVjMAfYBERYBERfKAAERFAHKAAEREgHKAAEREAHKAFAOINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WUAwg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxZQCiDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFhg9AfzLH8hQByDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFhXLHxPLHwEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxbLH8sfWPoCWPoCEssHyFADINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WUAP6AhPLHxM+ABzLPxPLHxPLD8kBzMkBzNXKpIw='
    );
    let builder = beginCell();
    builder.storeRef(__system);
    builder.storeUint(0, 1);
    initAuctionContract_init_args({
        $$type: 'AuctionContract_init_args',
        mp_addr,
        nft_addr,
        created_at,
        body,
    })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

const AuctionContract_errors: { [key: number]: { message: string } } = {
    2: { message: `Stack undeflow` },
    3: { message: `Stack overflow` },
    4: { message: `Integer overflow` },
    5: { message: `Integer out of expected range` },
    6: { message: `Invalid opcode` },
    7: { message: `Type check error` },
    8: { message: `Cell overflow` },
    9: { message: `Cell underflow` },
    10: { message: `Dictionary error` },
    13: { message: `Out of gas error` },
    32: { message: `Method ID not found` },
    34: { message: `Action is invalid or not supported` },
    37: { message: `Not enough TON` },
    38: { message: `Not enough extra-currencies` },
    128: { message: `Null reference exception` },
    129: { message: `Invalid serialization prefix` },
    130: { message: `Invalid incoming message` },
    131: { message: `Constraints error` },
    132: { message: `Access denied` },
    133: { message: `Contract stopped` },
    134: { message: `Invalid argument` },
    135: { message: `Code of a contract was not found` },
    136: { message: `Invalid address` },
    137: { message: `Masterchain support is not enabled for this contract` },
};

const AuctionContract_types: ABIType[] = [
    {
        name: 'StateInit',
        header: null,
        fields: [
            { name: 'code', type: { kind: 'simple', type: 'cell', optional: false } },
            { name: 'data', type: { kind: 'simple', type: 'cell', optional: false } },
        ],
    },
    {
        name: 'Context',
        header: null,
        fields: [
            { name: 'bounced', type: { kind: 'simple', type: 'bool', optional: false } },
            { name: 'sender', type: { kind: 'simple', type: 'address', optional: false } },
            { name: 'value', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
            { name: 'raw', type: { kind: 'simple', type: 'slice', optional: false } },
        ],
    },
    {
        name: 'SendParameters',
        header: null,
        fields: [
            { name: 'bounce', type: { kind: 'simple', type: 'bool', optional: false } },
            { name: 'to', type: { kind: 'simple', type: 'address', optional: false } },
            { name: 'value', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
            { name: 'mode', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
            { name: 'body', type: { kind: 'simple', type: 'cell', optional: true } },
            { name: 'code', type: { kind: 'simple', type: 'cell', optional: true } },
            { name: 'data', type: { kind: 'simple', type: 'cell', optional: true } },
        ],
    },
    {
        name: 'Deploy',
        header: 2490013878,
        fields: [
            {
                name: 'queryId',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
        ],
    },
    {
        name: 'DeployOk',
        header: 2952335191,
        fields: [
            {
                name: 'queryId',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
        ],
    },
    {
        name: 'FactoryDeploy',
        header: 1829761339,
        fields: [
            {
                name: 'queryId',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
            { name: 'cashback', type: { kind: 'simple', type: 'address', optional: false } },
        ],
    },
    {
        name: 'GetRoyaltyParams',
        header: 1765620048,
        fields: [
            {
                name: 'query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
        ],
    },
    {
        name: 'ReportRoyaltyParams',
        header: 2831876269,
        fields: [
            {
                name: 'query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
            {
                name: 'numerator',
                type: { kind: 'simple', type: 'uint', optional: false, format: 16 },
            },
            {
                name: 'denominator',
                type: { kind: 'simple', type: 'uint', optional: false, format: 16 },
            },
            { name: 'destination', type: { kind: 'simple', type: 'address', optional: false } },
        ],
    },
    {
        name: 'FillUp',
        header: 923790417,
        fields: [
            {
                name: 'query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
        ],
    },
    {
        name: 'ClaimUsername',
        header: 1474634135,
        fields: [
            {
                name: 'query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
            { name: 'domain', type: { kind: 'simple', type: 'string', optional: false } },
            { name: 'content', type: { kind: 'simple', type: 'cell', optional: false } },
        ],
    },
    {
        name: 'NftItemDeploy',
        header: 1481937446,
        fields: [
            {
                name: 'query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
            { name: 'owner', type: { kind: 'simple', type: 'address', optional: false } },
            { name: 'domain', type: { kind: 'simple', type: 'string', optional: false } },
            { name: 'content', type: { kind: 'simple', type: 'cell', optional: false } },
        ],
    },
    {
        name: 'OutbidNotification',
        header: 1434249760,
        fields: [
            {
                name: 'query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
        ],
    },
    {
        name: 'CompleteAuction',
        header: 1878586964,
        fields: [
            {
                name: 'query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
        ],
    },
    {
        name: 'Transfer',
        header: 1607220500,
        fields: [
            {
                name: 'query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
            { name: 'new_owner', type: { kind: 'simple', type: 'address', optional: false } },
            {
                name: 'response_destination',
                type: { kind: 'simple', type: 'address', optional: false },
            },
            { name: 'custom_payload', type: { kind: 'simple', type: 'cell', optional: true } },
            {
                name: 'forward_amount',
                type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' },
            },
            {
                name: 'forward_payload',
                type: { kind: 'simple', type: 'slice', optional: false, format: 'remainder' },
            },
        ],
    },
    {
        name: 'Excesses',
        header: 3576854235,
        fields: [
            {
                name: 'query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
        ],
    },
    {
        name: 'OwnershipAssigned',
        header: 85167505,
        fields: [
            {
                name: 'query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
            { name: 'prev_owner', type: { kind: 'simple', type: 'address', optional: false } },
            {
                name: 'forward_payload',
                type: { kind: 'simple', type: 'slice', optional: false, format: 'remainder' },
            },
        ],
    },
    {
        name: 'GetStaticData',
        header: 801842850,
        fields: [
            {
                name: 'query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
        ],
    },
    {
        name: 'ReportStaticData',
        header: 2339837749,
        fields: [
            {
                name: 'query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
            { name: 'index', type: { kind: 'simple', type: 'uint', optional: false, format: 256 } },
            { name: 'collection', type: { kind: 'simple', type: 'address', optional: false } },
        ],
    },
    {
        name: 'PutForSale',
        header: 1910901130,
        fields: [
            {
                name: 'query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
            { name: 'action', type: { kind: 'simple', type: 'uint', optional: false, format: 8 } },
            { name: 'sale_address', type: { kind: 'simple', type: 'address', optional: false } },
        ],
    },
    {
        name: 'CancelAuction',
        header: 422837155,
        fields: [
            {
                name: 'query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
        ],
    },
    {
        name: 'StopAuction',
        header: 1455875007,
        fields: [
            {
                name: 'query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
        ],
    },
    {
        name: 'NewBid',
        header: 777291430,
        fields: [
            {
                name: 'query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
        ],
    },
    {
        name: 'CancelSale',
        header: 1122373953,
        fields: [
            {
                name: 'query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
        ],
    },
    {
        name: 'BuyNFT',
        header: 1685477321,
        fields: [
            {
                name: 'query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
        ],
    },
    {
        name: 'NftCollectionData',
        header: null,
        fields: [
            {
                name: 'next_item_index',
                type: { kind: 'simple', type: 'int', optional: false, format: 257 },
            },
            { name: 'collection_content', type: { kind: 'simple', type: 'cell', optional: false } },
            { name: 'owner_address', type: { kind: 'simple', type: 'address', optional: false } },
        ],
    },
    {
        name: 'RoyaltyParams',
        header: null,
        fields: [
            {
                name: 'numerator',
                type: { kind: 'simple', type: 'uint', optional: false, format: 16 },
            },
            {
                name: 'denominator',
                type: { kind: 'simple', type: 'uint', optional: false, format: 16 },
            },
            { name: 'destination', type: { kind: 'simple', type: 'address', optional: false } },
        ],
    },
    {
        name: 'PriceRangeConfig',
        header: null,
        fields: [
            { name: 'start', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
            { name: 'end', type: { kind: 'simple', type: 'int', optional: false, format: 257 } },
        ],
    },
    {
        name: 'AuctionInfo',
        header: null,
        fields: [
            { name: 'max_bid_address', type: { kind: 'simple', type: 'address', optional: true } },
            {
                name: 'max_bid_amount',
                type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' },
            },
            {
                name: 'auction_end_time',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
        ],
    },
    {
        name: 'NftItemData',
        header: null,
        fields: [
            { name: 'is_initialized', type: { kind: 'simple', type: 'bool', optional: false } },
            { name: 'index', type: { kind: 'simple', type: 'uint', optional: false, format: 256 } },
            {
                name: 'collection_address',
                type: { kind: 'simple', type: 'address', optional: false },
            },
            { name: 'owner', type: { kind: 'simple', type: 'address', optional: false } },
            { name: 'content', type: { kind: 'simple', type: 'cell', optional: false } },
        ],
    },
    {
        name: 'AuctionSaleData',
        header: null,
        fields: [
            {
                name: 'op_code',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
            { name: 'end', type: { kind: 'simple', type: 'bool', optional: false } },
            {
                name: 'end_time',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
            { name: 'mp_addr', type: { kind: 'simple', type: 'address', optional: false } },
            { name: 'nft_addr', type: { kind: 'simple', type: 'address', optional: false } },
            { name: 'nft_owner', type: { kind: 'simple', type: 'address', optional: false } },
            {
                name: 'last_bid',
                type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' },
            },
            { name: 'last_member', type: { kind: 'simple', type: 'address', optional: false } },
            {
                name: 'min_step',
                type: { kind: 'simple', type: 'uint', optional: false, format: 8 },
            },
            { name: 'mp_fee_addr', type: { kind: 'simple', type: 'address', optional: false } },
            {
                name: 'mp_fee_factor',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
            {
                name: 'mp_fee_base',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
            {
                name: 'royalty_fee_addr',
                type: { kind: 'simple', type: 'address', optional: false },
            },
            {
                name: 'royalty_fee_factor',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
            {
                name: 'royalty_fee_base',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
            {
                name: 'max_bid',
                type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' },
            },
            {
                name: 'min_bid',
                type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' },
            },
            {
                name: 'created_at',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
            {
                name: 'last_bid_at',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
            { name: 'is_canceled', type: { kind: 'simple', type: 'bool', optional: false } },
        ],
    },
    {
        name: 'AuctionData',
        header: null,
        fields: [
            { name: 'activated', type: { kind: 'simple', type: 'bool', optional: false } },
            { name: 'end', type: { kind: 'simple', type: 'bool', optional: false } },
            {
                name: 'end_time',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
            { name: 'mp_addr', type: { kind: 'simple', type: 'address', optional: false } },
            { name: 'nft_addr', type: { kind: 'simple', type: 'address', optional: false } },
            { name: 'nft_owner', type: { kind: 'simple', type: 'address', optional: false } },
            {
                name: 'last_bid',
                type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' },
            },
            { name: 'last_member', type: { kind: 'simple', type: 'address', optional: false } },
            {
                name: 'min_step',
                type: { kind: 'simple', type: 'uint', optional: false, format: 8 },
            },
            { name: 'mp_fee_addr', type: { kind: 'simple', type: 'address', optional: false } },
            {
                name: 'mp_fee_factor',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
            {
                name: 'mp_fee_base',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
            {
                name: 'royalty_fee_addr',
                type: { kind: 'simple', type: 'address', optional: false },
            },
            {
                name: 'royalty_fee_factor',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
            {
                name: 'royalty_fee_base',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
            {
                name: 'max_bid',
                type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' },
            },
            {
                name: 'min_bid',
                type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' },
            },
            {
                name: 'created_at',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
            {
                name: 'last_bid_at',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
            { name: 'is_canceled', type: { kind: 'simple', type: 'bool', optional: false } },
            {
                name: 'step_time',
                type: { kind: 'simple', type: 'uint', optional: false, format: 16 },
            },
            {
                name: 'last_query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
        ],
    },
    {
        name: 'SaleData',
        header: null,
        fields: [
            {
                name: 'op_code',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
            { name: 'is_complete', type: { kind: 'simple', type: 'bool', optional: false } },
            {
                name: 'created_at',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
            { name: 'mp_addr', type: { kind: 'simple', type: 'address', optional: false } },
            { name: 'nft_addr', type: { kind: 'simple', type: 'address', optional: false } },
            { name: 'nft_owner', type: { kind: 'simple', type: 'address', optional: false } },
            {
                name: 'full_price',
                type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' },
            },
            { name: 'mp_fee_addr', type: { kind: 'simple', type: 'address', optional: false } },
            {
                name: 'mp_fee',
                type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' },
            },
            {
                name: 'royalty_fee_addr',
                type: { kind: 'simple', type: 'address', optional: false },
            },
            {
                name: 'royalty_fee',
                type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' },
            },
        ],
    },
    {
        name: 'FixPriceData',
        header: null,
        fields: [
            { name: 'is_complete', type: { kind: 'simple', type: 'bool', optional: false } },
            {
                name: 'created_at',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
            { name: 'mp_addr', type: { kind: 'simple', type: 'address', optional: false } },
            { name: 'nft_addr', type: { kind: 'simple', type: 'address', optional: false } },
            { name: 'nft_owner', type: { kind: 'simple', type: 'address', optional: false } },
            {
                name: 'full_price',
                type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' },
            },
            { name: 'mp_fee_addr', type: { kind: 'simple', type: 'address', optional: false } },
            {
                name: 'mp_fee',
                type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' },
            },
            {
                name: 'royalty_fee_addr',
                type: { kind: 'simple', type: 'address', optional: false },
            },
            {
                name: 'royalty_fee',
                type: { kind: 'simple', type: 'uint', optional: false, format: 'coins' },
            },
            {
                name: 'sold_at',
                type: { kind: 'simple', type: 'uint', optional: false, format: 32 },
            },
            {
                name: 'last_query_id',
                type: { kind: 'simple', type: 'uint', optional: false, format: 64 },
            },
        ],
    },
];

const AuctionContract_getters: ABIGetter[] = [
    {
        name: 'get_sale_data',
        arguments: [],
        returnType: { kind: 'simple', type: 'AuctionSaleData', optional: false },
    },
    {
        name: 'get_auction_data',
        arguments: [],
        returnType: { kind: 'simple', type: 'AuctionData', optional: false },
    },
];

const AuctionContract_receivers: ABIReceiver[] = [
    { receiver: 'internal', message: { kind: 'empty' } },
    { receiver: 'internal', message: { kind: 'typed', type: 'OwnershipAssigned' } },
    { receiver: 'internal', message: { kind: 'typed', type: 'CancelAuction' } },
    { receiver: 'internal', message: { kind: 'typed', type: 'StopAuction' } },
    { receiver: 'internal', message: { kind: 'typed', type: 'NewBid' } },
    { receiver: 'external', message: { kind: 'text', text: 'end' } },
];

export class AuctionContract implements Contract {
    static async init(mp_addr: Address, nft_addr: Address, created_at: bigint, body: Cell) {
        return await AuctionContract_init(mp_addr, nft_addr, created_at, body);
    }

    static async fromInit(mp_addr: Address, nft_addr: Address, created_at: bigint, body: Cell) {
        const init = await AuctionContract_init(mp_addr, nft_addr, created_at, body);
        const address = contractAddress(0, init);
        return new AuctionContract(address, init);
    }

    static fromAddress(address: Address) {
        return new AuctionContract(address);
    }

    readonly address: Address;
    readonly init?: { code: Cell; data: Cell };
    readonly abi: ContractABI = {
        types: AuctionContract_types,
        getters: AuctionContract_getters,
        receivers: AuctionContract_receivers,
        errors: AuctionContract_errors,
    };

    private constructor(address: Address, init?: { code: Cell; data: Cell }) {
        this.address = address;
        this.init = init;
    }

    async send(
        provider: ContractProvider,
        via: Sender,
        args: { value: bigint; bounce?: boolean | null | undefined },
        message: null | OwnershipAssigned | CancelAuction | StopAuction | NewBid
    ) {
        let body: Cell | null = null;
        if (message === null) {
            body = new Cell();
        }
        if (
            message &&
            typeof message === 'object' &&
            !(message instanceof Slice) &&
            message.$$type === 'OwnershipAssigned'
        ) {
            body = beginCell().store(storeOwnershipAssigned(message)).endCell();
        }
        if (
            message &&
            typeof message === 'object' &&
            !(message instanceof Slice) &&
            message.$$type === 'CancelAuction'
        ) {
            body = beginCell().store(storeCancelAuction(message)).endCell();
        }
        if (
            message &&
            typeof message === 'object' &&
            !(message instanceof Slice) &&
            message.$$type === 'StopAuction'
        ) {
            body = beginCell().store(storeStopAuction(message)).endCell();
        }
        if (
            message &&
            typeof message === 'object' &&
            !(message instanceof Slice) &&
            message.$$type === 'NewBid'
        ) {
            body = beginCell().store(storeNewBid(message)).endCell();
        }
        if (body === null) {
            throw new Error('Invalid message type');
        }

        await provider.internal(via, { ...args, body: body });
    }

    async sendExternal(provider: ContractProvider, message: 'end') {
        let body: Cell | null = null;
        if (message === 'end') {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (body === null) {
            throw new Error('Invalid message type');
        }

        await provider.external(body);
    }

    async getGetSaleData(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('get_sale_data', builder.build())).stack;
        const result = loadTupleAuctionSaleData(source);
        return result;
    }

    async getGetAuctionData(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('get_auction_data', builder.build())).stack;
        const result = loadTupleAuctionData(source);
        return result;
    }
}
