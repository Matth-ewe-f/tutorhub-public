const PostReview = require("../model/PostReview.ts");
const mongoose = require("mongoose");

export class PostReviewDao {

    async create(postId: string, posterId: string, reviewerId: string, reviewDescription: string, rating: number, isAnonymous?: boolean) {
        let newPostReview: any = {postId, posterId, reviewerId, reviewDescription, rating}
        if ( isAnonymous === true ) {
            newPostReview.isAnonymous = isAnonymous;
        }
        const data = await PostReview.create(newPostReview);
        return data;
    }

    async readAllByPostId(postId: any) {
        try {
            const postReviews = await PostReview.find({ postId: postId });
            return postReviews;
        } catch (error) {
            console.error('Error fetching post reviews:', error)
        }
    }

    async readOne( id: any) {
        const postReview = await PostReview.findOne({ _id: id});
        return postReview;
    }

    async readAll() {
        try {
            const postReviews = await PostReview.find();
            return postReviews;
        } catch (error) {
            console.error('Error fetching post reviews:', error);
        }
    }

    async delete(id : any) {
        const data = await PostReview.findOneAndDelete({ _id: id});
        return data;
    }
    
    async deleteAll(){
        await PostReview.deleteMany({})
    }
}
module.exports = PostReviewDao;