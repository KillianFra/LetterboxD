import express, { NextFunction } from "express";
import * as friendService from "../services/friendService";

const router = express.Router();

router.get("/following", async (req: any, res: any) => {
    console.log(req.user);
    const following = await friendService.getFollowing(req.user.id);
    res.status(200).json({ status: true, following });
})

router.get("/followers", async (req: any, res: any) => {
    let offset = 0
    try {
        offset = req.query.page ? parseInt(req.query.page as string) : 0;
    } catch (error) {
        res.status(400).json({ status: false, message: "Invalid page number" });
    }
    const followers = await friendService.getFollowers(offset, req.user.id);
    res.status(200).json({ status: true, followers });
})


router.post("/follow", async (req: any, res: any, next: NextFunction) => {
    try {
      const friendId = req.body.friendId;
      if (!friendId) {
        return res.status(400).json({ status: false, message: "Friend id is required" });
      }
      const follow = await friendService.follow(req.user.id, friendId);
      res.status(200).json({ status: true, message: "Followed successfully", follow });
    } catch (error) {
      next(error); // Pass error to middleware
    }
});

router.post("/unfollow", async (req: any, res: any, next: NextFunction) => {
    try {
        const friendId = req.body.friendId;
        if (!friendId) {
            return res.status(400).json({ status: false, message: "Friend id is required" });
        }
        const unfollow = await friendService.unfollow(req.user.id, friendId);
        res.status(200).json({ status: true, unfollow });
    } catch (error) {
        next(error); // Forward error to middleware
    }
});


export default router;
