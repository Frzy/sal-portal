import UnauthorizedAlert from '@c/UnauthorizedAlert'

import { getCheckouts } from '@/lib/checkouts'
import { getCosts } from '@/lib/costs'
import { getCosts as getPullTabCosts } from '@/lib/pullTabCosts'
import { getTransaction } from '@/lib/pullTabTransactions'
import { findQohGame } from '@/lib/qohGames'
import { getServerAuthSession } from '@/util/auth'
import DashboardView from '@/views/dashboard'

function getKitchenStats(
  costs: Kitchen.Cost.ServerItem[],
  checkouts: Kitchen.Checkout.ServerItem[],
): Kitchen.Stats {
  const checkoutStats = checkouts.reduce(
    (stats, c) => {
      return {
        ...stats,
        totalDeposits: stats.totalDeposits + c.deposit,
        totalSales: stats.totalSales + c.sales,
        totalDrinkChips: stats.totalDrinkChips + c.drinkChips,
        totalOrders: stats.totalOrders + c.orders.reduce((sum, o) => sum + o.menuItemQuantity, 0),
        totalServices: stats.totalServices + 1,
      }
    },
    {
      totalDeposits: 0,
      totalSales: 0,
      totalDrinkChips: 0,
      totalOrders: 0,
      totalServices: 0,
    },
  )
  const totalCost = costs.reduce((sum, c) => sum + c.amount, 0)
  const netProfit = checkoutStats.totalSales - totalCost
  const netProfitMargin = checkoutStats.totalSales ? netProfit / checkoutStats.totalSales : 0
  const profitPercent = totalCost ? netProfit / totalCost : 0

  return {
    ...checkoutStats,
    totalCost,
    profitPercent,
    netProfit,
    netProfitMargin,
  }
}
function getPullTabStats(
  costs: PullTab.Cost.ServerItem[],
  transactions: PullTab.Transaction.ServerItem[],
): PullTab.Stats {
  const bag = transactions.length ? transactions[transactions.length - 1].runningTotal ?? 0 : 0
  const cost = costs.reduce((sum, c) => sum + c.boxPrice, 0)
  const sums = transactions.reduce(
    (sums, t) => {
      return {
        deposit: sums.deposit + (t.type === 'BankDeposit' ? t.amount : 0),
        machine: sums.machine + (t.type === 'MachineWithdrawal' ? t.amount : 0),
        payout: sums.payout + (t.type === 'TabPayout' ? t.amount : 0),
      }
    },
    {
      deposit: 0,
      machine: 0,
      payout: 0,
    },
  )

  return {
    bag,
    cost,
    ...sums,
  }
}

export default async function Home(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()

  if (!session?.user) return <UnauthorizedAlert />

  const kitchenCosts = await getCosts()
  const kitchenServices = await getCheckouts()
  const kitchenStats = getKitchenStats(kitchenCosts, kitchenServices)

  const qohGame = await findQohGame((g) => !g.endDate)

  const pullTabCosts = await getPullTabCosts()
  const pullTabTransactions = await getTransaction()
  const pullTabStats = getPullTabStats(pullTabCosts, pullTabTransactions)

  return (
    <DashboardView
      qohGame={qohGame}
      kitchenStats={kitchenStats}
      lastService={kitchenServices[kitchenServices.length - 1]}
      pullTabStats={pullTabStats}
    />
  )
}
