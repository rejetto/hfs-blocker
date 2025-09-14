exports.version = 1
exports.description = "block requests based on User-Agent or other headers"
exports.apiRequired = 4 // subscribeConfig
exports.repo = "rejetto/hfs-blocker"
exports.preview = ["https://github.com/user-attachments/assets/73886f17-e3b8-4454-a9bb-7698a16ecfde"]

exports.config = {
    headers: { type: 'array', defaultValue: [{ name: 'User-Agent' }], fields: {
        name: { helperText: "Case-insensitive" },
        regexp: { label: "Reg.exp.", helperText: "If the header value matches this reg.exp. (case-insensitive), the request is blocked" },
    } },
}
exports.configDialog = { maxWidth: 'md' }

exports.init = api => {
    let compiled = {}
    api.subscribeConfig('headers', a => {
        compiled = {}
        if (a) for (const x of a)
            if (x.regexp)
                try { compiled[x.name] = new RegExp(x.regexp, 'i') }
                catch(e) { api.log(String(e)) }
    })
    const {disconnect} = api.require('./connections')
    return {
        middleware(ctx) {
            for (const [k, v] of Object.entries(compiled))
                if (v.test(ctx.get(k))) {
                    disconnect(ctx, 'blocker plugin')
                    api.log(`blocked ${ctx.ip} for ${k} is ${ctx.get(k)}`)
                    ctx.stop()
                }
        }
    }
}