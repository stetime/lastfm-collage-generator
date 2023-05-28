import { Request, Response } from 'express'
function unknownEndpoint(req: Request, res: Response) {
  res.status(404).send({ error: 'unknown endpoint' })
}

export default unknownEndpoint
