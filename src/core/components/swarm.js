'use strict'

const multiaddr = require('multiaddr')
const promisify = require('promisify-es6')
const flatMap = require('lodash.flatmap')
const values = require('lodash.values')

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

module.exports = function swarm (self) {
  return {
    peers: promisify((opts, callback) => {
      if (typeof opts === 'function') {
        callback = opts
        opts = {}
      }

      if (!self.isOnline()) {
        return callback(OFFLINE_ERROR)
      }

      const verbose = opts.v || opts.verbose
      // TODO: return latency and streams when verbose is set
      // we currently don't have this information

      const peers = self._peerInfoBook.getAll()
      const keys = Object.keys(peers)

      const peerList = flatMap(keys, (id) => {
        const peer = peers[id]

        return peer.multiaddrs.map((addr) => {
          const res = {
            addr: addr,
            peer: peers[id]
          }

          if (verbose) {
            res.latency = 'unknown'
          }

          return res
        })
      })

      callback(null, peerList)
    }),

    // all the addrs we know
    addrs: promisify((callback) => {
      if (!self.isOnline()) {
        return callback(OFFLINE_ERROR)
      }

      const peers = values(self._peerInfoBook.getAll())
      callback(null, peers)
    }),

    localAddrs: promisify((callback) => {
      if (!self.isOnline()) {
        return callback(OFFLINE_ERROR)
      }

      callback(null, self._libp2pNode.peerInfo.multiaddrs)
    }),

    connect: promisify((maddr, callback) => {
      if (!self.isOnline()) {
        return callback(OFFLINE_ERROR)
      }

      if (typeof maddr === 'string') {
        maddr = multiaddr(maddr)
      }

      self._libp2pNode.dialByMultiaddr(maddr, callback)
    }),

    disconnect: promisify((maddr, callback) => {
      if (!self.isOnline()) {
        return callback(OFFLINE_ERROR)
      }

      if (typeof maddr === 'string') {
        maddr = multiaddr(maddr)
      }

      self._libp2pNode.hangUpByMultiaddr(maddr, callback)
    }),

    filters: promisify((callback) => {
      // TODO
      throw new Error('Not implemented')
    })
  }
}
