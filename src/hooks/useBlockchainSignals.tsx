import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWeb3Auth } from '@web3auth/modal/react'
import { TRADING_SIGNALS_ADDRESS, TRADING_SIGNALS_ABI } from '@/utils/contract'

interface UseBlockchainSignalsResult {
  isCreatingSignal: boolean
  isClosingSignal: boolean
  createSignalOnBlockchain: (databaseId: string) => Promise<{ success: boolean; txHash?: string; error?: string }>
  closeSignalOnBlockchain: (signalId: number) => Promise<{ success: boolean; txHash?: string; error?: string }>
  getSignalFromBlockchain: (signalId: number) => Promise<any>
  error: string | null
}

export const useBlockchainSignals = (): UseBlockchainSignalsResult => {
  const [isCreatingSignal, setIsCreatingSignal] = useState(false)
  const [isClosingSignal, setIsClosingSignal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { provider, isConnected } = useWeb3Auth()

  // Get ethers provider and signer
  const getProviderAndSigner = useCallback(async () => {
    if (!provider || !isConnected) {
      throw new Error('Web3Auth not connected')
    }

    try {
      // Create ethers provider from Web3Auth provider
      const ethersProvider = new ethers.BrowserProvider(provider)
      const signer = await ethersProvider.getSigner()
      
      // Verify we're on the correct network (Avalanche Fuji Testnet)
      const network = await ethersProvider.getNetwork()
      if (network.chainId !== BigInt(43113)) {
        throw new Error('Please switch to Avalanche Fuji Testnet')
      }

      return { provider: ethersProvider, signer }
    } catch (err) {
      console.error('Error getting provider/signer:', err)
      throw err
    }
  }, [provider, isConnected])

  // Create contract instance
  const getContract = useCallback(async () => {
    const { signer } = await getProviderAndSigner()
    return new ethers.Contract(TRADING_SIGNALS_ADDRESS, TRADING_SIGNALS_ABI, signer)
  }, [getProviderAndSigner])

  // Create signal on blockchain
  const createSignalOnBlockchain = useCallback(async (databaseId: string) => {
    setIsCreatingSignal(true)
    setError(null)

    try {
      console.log('Creating signal on blockchain for database ID:', databaseId)
      
      const contract = await getContract()
      
      // Estimate gas
      const gasEstimate = await contract.createSignalFromDatabase.estimateGas(databaseId)
      const gasLimit = gasEstimate * BigInt(120) / BigInt(100) // Add 20% buffer
      
      console.log('Estimated gas:', gasEstimate.toString())
      
      // Send transaction
      const tx = await contract.createSignalFromDatabase(databaseId, {
        gasLimit: gasLimit
      })
      
      console.log('Transaction sent:', tx.hash)
      
      // Wait for confirmation
      const receipt = await tx.wait()
      
      if (receipt.status === 1) {
        console.log('Signal created successfully on blockchain:', receipt.transactionHash)
        
        // Parse events to get the signal ID
        const signalCreatedEvent = receipt.logs.find((log: any) => {
          try {
            const parsed = contract.interface.parseLog(log)
            return parsed?.name === 'SignalCreated'
          } catch {
            return false
          }
        })
        
        let signalId = null
        if (signalCreatedEvent) {
          const parsed = contract.interface.parseLog(signalCreatedEvent)
          signalId = parsed?.args?.signalId?.toString()
          console.log('Blockchain signal ID:', signalId)
        }
        
        return {
          success: true,
          txHash: receipt.transactionHash,
          signalId: signalId
        }
      } else {
        throw new Error('Transaction failed')
      }
      
    } catch (err: any) {
      console.error('Error creating signal on blockchain:', err)
      
      let errorMessage = 'Failed to create signal on blockchain'
      
      if (err.reason) {
        errorMessage = err.reason
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsCreatingSignal(false)
    }
  }, [getContract])

  // Close signal on blockchain
  const closeSignalOnBlockchain = useCallback(async (signalId: number) => {
    setIsClosingSignal(true)
    setError(null)

    try {
      console.log('Closing signal on blockchain:', signalId)
      
      const contract = await getContract()
      
      // Estimate gas
      const gasEstimate = await contract.closeSignalManually.estimateGas(signalId)
      const gasLimit = gasEstimate * BigInt(120) / BigInt(100) // Add 20% buffer
      
      console.log('Estimated gas for closing:', gasEstimate.toString())
      
      // Send transaction
      const tx = await contract.closeSignalManually(signalId, {
        gasLimit: gasLimit
      })
      
      console.log('Close transaction sent:', tx.hash)
      
      // Wait for confirmation
      const receipt = await tx.wait()
      
      if (receipt.status === 1) {
        console.log('Signal closed successfully on blockchain:', receipt.transactionHash)
        
        return {
          success: true,
          txHash: receipt.transactionHash
        }
      } else {
        throw new Error('Transaction failed')
      }
      
    } catch (err: any) {
      console.error('Error closing signal on blockchain:', err)
      
      let errorMessage = 'Failed to close signal on blockchain'
      
      if (err.reason) {
        errorMessage = err.reason
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsClosingSignal(false)
    }
  }, [getContract])

  // Get signal from blockchain
  const getSignalFromBlockchain = useCallback(async (signalId: number) => {
    try {
      console.log('Getting signal from blockchain:', signalId)
      
      const contract = await getContract()
      
      // Get full signal data
      const signalData = await contract.getFullSignalData(signalId)
      
      console.log('Signal data from blockchain:', signalData)
      
      return {
        success: true,
        data: signalData
      }
      
    } catch (err: any) {
      console.error('Error getting signal from blockchain:', err)
      
      let errorMessage = 'Failed to get signal from blockchain'
      
      if (err.reason) {
        errorMessage = err.reason
      } else if (err.message) {
        errorMessage = err.message
      }
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }, [getContract])

  return {
    isCreatingSignal,
    isClosingSignal,
    createSignalOnBlockchain,
    closeSignalOnBlockchain,
    getSignalFromBlockchain,
    error
  }
}