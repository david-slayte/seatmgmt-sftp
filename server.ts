import * as _ from 'lodash'
import * as csv from 'csvtojson'
import * as fs from 'fs'
import * as path from 'path'
import * as ssh2 from 'ssh2'
import axios from 'axios'

import { mapLatitudeUserToSeat, compareConstantTime, notImplemented } from './utilities'

const STATUS_CODE = ssh2.SFTP_STATUS_CODE

const USERS_FILE = process.env.USERS_FILE
if (!USERS_FILE) {
  throw 'Set environment `USERS_FILE`'
}

const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))

let handleCount = 0

const handleAuthentication = () => {
  return (ctx) => {
    if (
      ctx.method === 'password' &&
      compareConstantTime(ctx.password, users[ctx.username])
    ) {
      ctx.accept()
    } else {
      ctx.reject()
    }
  }
}

const handleSftpOpen = (sftpStream) => {
  return (reqid) => {
    var handle = Buffer.alloc(4)
    handle.writeUInt32BE(handleCount++, 0, true)
    sftpStream.handle(reqid, handle)
  }
}

const handleSftpWrite = (sftpStream) => {
  return async (reqid, handle, offset, data) => {
    if (handle.length !== 4) {
      return sftpStream.status(reqid, STATUS_CODE.FAILURE)
    }

    const latitudeUsers = await csv().fromString(data.toString())
    const seats = latitudeUsers.map(mapLatitudeUserToSeat)

    await axios.put(`${process.env.SEATMGMT_SEAT_UPDATE}`, {
      seats
    }, {
      headers: {
        Authorization: process.env.SFTP_KEY
      }
    })
  }
}

const handleSftpClose = (sftpStream) => {
  return (reqid, handle) => {
    if (handle.length !== 4) {
      return sftpStream.status(reqid, STATUS_CODE.FAILURE)
    }
    sftpStream.status(reqid, STATUS_CODE.OK)
  }
}

const handleSessionSFTP = () => {
  return (accept, reject) => {
    // `sftpStream` is an `SFTPStream` instance in server mode
    // see: https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md
    const sftpStream = accept()
    sftpStream
      .on('OPEN', handleSftpOpen(sftpStream))
      .on('READ', notImplemented('SFTP READ'))
      .on('FSTAT', notImplemented('SFTP FSTAT'))
      .on('FSETSTAT', notImplemented('SFTP FSETSTAT'))
      .on('OPENDIR', notImplemented('SFTP OPENDIR'))
      .on('READDIR', notImplemented('SFTP READDIR'))
      .on('LSTAT', notImplemented('SFTP LSTAT'))
      .on('STAT', notImplemented('SFTP STAT'))
      .on('REMOVE', notImplemented('SFTP REMOVE'))
      .on('RMDIR', notImplemented('SFTP RMDIR'))
      .on('REALPATH', notImplemented('SFTP REALPATH'))
      .on('SETSTAT', notImplemented('SFTP SETSTAT'))
      .on('MKDIR', notImplemented('SFTP MKDIR'))
      .on('RENAME', notImplemented('SFTP RENAME'))
      .on('SYMLINK', notImplemented('SFTP SYMLINK'))
      .on('WRITE', handleSftpWrite(sftpStream))
      .on('DATA', notImplemented('SFTP DATA'))
      .on('CLOSE', handleSftpClose(sftpStream))
  }
}

const handleSession = () => {
  return (accept, reject) => {
    var session = accept()
    session.on('pty', notImplemented('pty'))
    session.on('window-change', notImplemented('window-change'))
    session.on('x11', notImplemented('x11'))
    session.on('env', notImplemented('env'))
    session.on('signal', notImplemented('signal'))
    session.on('auth-agent', notImplemented('auth-agent'))
    session.on('shell', notImplemented('shell'))
    session.on('exec', notImplemented('exec'))
    session.on('sftp', handleSessionSFTP())
    session.on('subsystem', notImplemented('subsystem'))
  }
}

const handleConnectionError = () => {
  return (err) => {
    console.error('Error: ', err)
  }
}

new ssh2.Server(
  {
    hostKeys: [fs.readFileSync(path.join(__dirname, 'key'))]
  },
  (connection) => {
    connection
      .on('authentication', handleAuthentication())
      .on('ready', () => {
        connection.on('session', handleSession())
      })
      .on('error', handleConnectionError())
      .on('end', () => {
        console.log('Client disconnected')
      })
      .on('close', (hadError) => {
        console.log(hadError ? 'errored' : '')
      })
  }
).listen(Number(process.env.PORT) || 22, '127.0.0.1', () => {
  console.log('SFTP listening on port ' + this.address().port)
})
