import {Request, Response} from 'express'
import {IPresenter} from '../../types/pres'
import Pres from '../../models/pres'
import fs from 'fs';

const pathFull = "C:\\Users\\Saralin\\IdeaProjects\\fullstack-typescript-mern-todo\\Meeting\\"

const getPresDatabase = async (req: Request, res: Response): Promise<void> => {
    try {
        const pres: IPresenter[] = await Pres.find()
        res.status(200).json({pres})
    } catch (error) {
        throw error
    }
}

const getPresFile = async (req: Request, res: Response): Promise<void> => {
    try {
        // const pres: IPresenter[] = [];
        for (const file of fs.readdirSync(pathFull)) {
            const data = fs.readFileSync(pathFull + '\\' + file).toString('utf8')
            let pres = createPres(data, file.toString())
            const query = { name: pres.name};
            await Pres.deleteMany(query);
            await pres.save()
            // pres.push(presenter)
        }
        const pres: IPresenter[] = await Pres.find()
        res.status(200).json({pres})
    } catch (error) {
        throw error
    }
}

function createPres(data: string, fileName: string): IPresenter {
    let timeNum = 5;
    if (data[0] === 'm') {
        timeNum = 10;
    } else if (data[0] === 'l') {
        timeNum = 15;
    }
    return new Pres({
        name: fileName.substring(0, fileName.length - 4),
        description: data.substring(2, data.length - 2),
        initTime: timeNum,
        time: timeNum,
        nonCompressedTime: timeNum,
        overtime: 0,
        extra: 0,
    });
}

const addPres = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as Pick<IPresenter, 'name' | 'description' | 'time'>
        const pres: IPresenter = new Pres({
            name: body.name,
            description: body.description,
            time: body.time,
            initTime: body.time,
            nonCompressedTime: body.time,
            overtime: 0,
            extra: 0,
        })
        // fs.writeFileSync(pathFull + '/'+ body.name + '.txt', addTodoHelper(body.time) + body.description + '^0')
        const newPres: IPresenter = await pres.save()
        const allPres: IPresenter[] = await Pres.find()
        res.status(201).json({message: 'Presenter added', presenter: newPres, pres: allPres})
    } catch (error) {
        throw error
    }
}

const deletePres = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedPres: IPresenter | null = await Pres.findByIdAndRemove(
            req.params.id
        )
        if (deletedPres !== null && fs.existsSync(pathFull + '\\' + deletedPres.name + '.txt')) {
            fs.unlink(pathFull + '\\' + deletedPres.name + '.txt', function (err) {
                if (err) return console.log(err);
                console.log('file deleted successfully');
            })
        }

        const allPres: IPresenter[] = await Pres.find()
        res.status(200).json({
            message: 'Presenter deleted',
            presenter: deletedPres,
            pres: allPres,
        })
    } catch (error) {
        throw error
    }
}

export {getPresFile, getPresDatabase, addPres, deletePres}
