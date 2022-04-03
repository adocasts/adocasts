import Event from '@ioc:Adonis/Core/Event'
import Database from '@ioc:Adonis/Lucid/Database'
import './auth'

Event.on('db:query', Database.prettyPrint)
