# Code originally by Simon Monk https://github.com/simonmonk/
# Modified by Alec Tuchscherer https://github.com/pyrophoenix100/
# If you somehow found this code, and decided to use it in some capacity,
# I'd like to ask you to rethink your approach, and not do that.

from . import MFRC522
import RPi.GPIO as GPIO
  
class SimpleMFRC522:

  READER = None
  
  KEY = [0xFF,0xFF,0xFF,0xFF,0xFF,0xFF]
  BLOCK_ADDRS = [6,7,8,9,10,11,12,13,14]
  
  def __init__(self):
    self.READER = MFRC522()
  
  def read(self):
      id, text = self.read_no_block()
      while not id:
          id, text = self.read_no_block()
      return id, text

  def read_id(self):
    id = self.read_id_no_block()
    while not id:
      id = self.read_id_no_block()
    return id

  def read_id_no_block(self):
      (status, TagType) = self.READER.MFRC522_Request(self.READER.PICC_REQIDL)
      if status != self.READER.MI_OK:
          return None
      (status, uid) = self.READER.MFRC522_Anticoll()
      if status != self.READER.MI_OK:
          return None
      return self.uid_to_num(uid)
  
  def read_no_block(self):
    (status, TagType) = self.READER.MFRC522_Request(self.READER.PICC_REQIDL)
    if status != self.READER.MI_OK:
        return None, None
    (status, uid) = self.READER.MFRC522_Anticoll()
    if status != self.READER.MI_OK:
        return None, None
    id = self.uid_to_num(uid)
    self.READER.MFRC522_SelectTag(uid)
    status = self.READER.MFRC522_Auth(self.READER.PICC_AUTHENT1A, 11, self.KEY, uid)
    data = []
    text_read = ''
    blocks = self.BLOCK_ADDRS[::4] #NTAG215 reads in 4 block increments, but writes one block at a time, this should correct this on the read side
    if status == self.READER.MI_OK:
        for block_num in blocks:
            block = self.READER.MFRC522_Read(block_num) 
            if block:
                        data += block
        if data:
             text_read = ''.join(chr(i) for i in data)
    self.READER.MFRC522_StopCrypto1()
    return id, text_read
    
  def write(self, text):
      id, text_in = self.write_no_block(text)
      while not id:
          id, text_in = self.write_no_block(text)
      return id, text_in

  def write_no_block(self, text):
      (status, TagType) = self.READER.MFRC522_Request(self.READER.PICC_REQIDL)
      if status != self.READER.MI_OK:
          return None, None
      (status, uid) = self.READER.MFRC522_Anticoll()
      if status != self.READER.MI_OK:
          return None, None
      id = self.uid_to_num(uid)
      self.READER.MFRC522_SelectTag(uid)
      status = self.READER.MFRC522_Auth(self.READER.PICC_AUTHENT1A, 11, self.KEY, uid)
      self.READER.MFRC522_Read(11)
      #try:
      if status == self.READER.MI_OK:
          data = bytearray()
          data.extend(bytearray(text.ljust(len(self.BLOCK_ADDRS) * 32, "\0").encode('ascii')))
          i = 0
          print(data)
          for block_num in self.BLOCK_ADDRS:
              print(data[(i*4):(i+1)*4])
              self.READER.MFRC522_Write(block_num,data[(i*4):(i+1)*4] + bytearray(b"\0"*12)) 
              i += 1
      #except:
      #    print(i, "Data block:", data[(i*4):(i+1)*4])
      self.READER.MFRC522_StopCrypto1()
      return id, text[0:(len(self.BLOCK_ADDRS) * 4)]
      
  def uid_to_num(self, uid):
      n = 0
      for i in range(0, 5):
          n = n * 256 + uid[i]
      return n
